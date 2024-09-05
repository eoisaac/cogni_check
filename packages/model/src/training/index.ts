import * as tf from '@tensorflow/tfjs-node'
import chalk from 'chalk'
import * as fs from 'fs'
import { Jimp } from 'jimp'
import * as path from 'path'

const PATHS = {
  logs: path.join(__dirname, '/logs'),
  model: path.join(__dirname, '../t3-model'),
  assets: path.join(__dirname, '/assets'),
}

const IMAGES_SRC = {
  healthy: { path: `${PATHS.assets}/healthy`, label: 0 },
  disorders: { path: `${PATHS.assets}/disorders`, label: 1 },
}

const IMAGE_SIZE = 180
const TRAINING_CONFIG = {
  imageDimension: [IMAGE_SIZE, IMAGE_SIZE] as [number, number],
  kernelSize: 3,
  batchSize: 32,
  epochs: 20,
}

const processImageWithJimp = async (imageBuffer: Buffer) => {
  const image = await Jimp.fromBuffer(imageBuffer)
  image.resize({
    w: TRAINING_CONFIG.imageDimension[0],
    h: TRAINING_CONFIG.imageDimension[1],
  })

  const pixels = new Uint8Array(image.bitmap.width * image.bitmap.height * 4)
  image.bitmap.data.copy(pixels)

  const normalizedPixels = Array.from(pixels).map((value) => value / 255.0)
  return new Float32Array(normalizedPixels)
}

const convertToTensor = (
  pixels: Float32Array,
  width: number,
  height: number,
) => {
  return tf.tensor3d(pixels, [height, width, 4], 'float32')
}

const processImage = async (imageBuffer: Buffer) => {
  const pixels = await processImageWithJimp(imageBuffer)

  return convertToTensor(
    pixels,
    TRAINING_CONFIG.imageDimension[0],
    TRAINING_CONFIG.imageDimension[1],
  )
}

// const processImage = (imageBuffer: Buffer) => {
//   return tf.node
//     .decodeImage(imageBuffer)
//     .resizeBilinear(TRAINING_CONFIG.imageDimension)
//     .toFloat()
//     .div(tf.scalar(255.0))
// }

const loadTrainingData = async (dirPath: string, label: number) => {
  console.log(chalk.yellow(`📂 Loading images from ${dirPath}...`))
  const files = fs.readdirSync(dirPath)

  const data = await Promise.all(
    files.map(async (file) => {
      const imagePath = path.join(dirPath, file)
      const imageBuffer = fs.readFileSync(imagePath)
      const tensor = await processImage(imageBuffer)
      console.log(tensor)
      return { tensor, label }
    }),
  )

  // const data = files.map((file) => {
  //   const imagePath = path.join(dirPath, file)
  //   const imageBuffer = fs.readFileSync(imagePath)
  //   const tensor = processImage(imageBuffer)
  //   return { tensor, label }
  // })

  return {
    images: data.map(({ tensor }) => tensor),
    labels: data.map(({ label }) => label),
  }
}

const getTrainingData = async () => {
  const results = await Promise.all(
    Object.values(IMAGES_SRC).map(({ path, label }) =>
      loadTrainingData(path, label),
    ),
  )

  const { images, labels } = results.reduce(
    (acc, result) => ({
      images: [...acc.images, ...result.images],
      labels: [...acc.labels, ...result.labels],
    }),
    { images: [], labels: [] },
  )

  const xs = tf.stack(images)
  const ys = tf.tensor1d(labels, 'int32')

  return { xs, ys }
}

const generateModel = async (convolucionalLayers: number = 2) => {
  console.log(chalk.yellow('🛠️ Generating model...'))
  const model = tf.sequential({ name: 't3-model' })

  model.add(
    tf.layers.conv2d({
      inputShape: [...TRAINING_CONFIG.imageDimension, 3],
      filters: 32,
      kernelSize: TRAINING_CONFIG.kernelSize,
      activation: 'relu',
    }),
  )

  model.add(tf.layers.maxPooling2d({ poolSize: [2, 2] }))

  Array.from({ length: convolucionalLayers - 1 }).forEach((_, i) => {
    model.add(
      tf.layers.conv2d({
        filters: 64 * Math.pow(2, i),
        kernelSize: TRAINING_CONFIG.kernelSize,
        activation: 'relu',
      }),
    )
    model.add(tf.layers.maxPooling2d({ poolSize: [2, 2] }))
  })

  model.add(tf.layers.flatten())
  model.add(tf.layers.dense({ units: 128, activation: 'relu' }))
  model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }))

  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: 'binaryCrossentropy',
    metrics: ['accuracy'],
  })

  console.log(chalk.yellow('📋 Model generated'))
  return model
}

const trainModel = async () => {
  console.log(chalk.yellow('🚂 Training model...'))
  const model = await generateModel(4)
  const { xs, ys } = await getTrainingData()

  const splitIdx = Math.floor(xs.shape[0] * 0.8)
  const [trainXs, testXs] = [
    xs.slice([0, 0, 0, 0], [splitIdx, ...TRAINING_CONFIG.imageDimension, 3]),
    xs.slice(
      [splitIdx, 0, 0, 0],
      [xs.shape[0] - splitIdx, ...TRAINING_CONFIG.imageDimension, 3],
    ),
  ]
  const [trainYs, testYs] = [ys.slice(0, splitIdx), ys.slice(splitIdx)]

  await model.fit(trainXs, trainYs, {
    epochs: TRAINING_CONFIG.epochs,
    batchSize: TRAINING_CONFIG.batchSize,
    validationData: [testXs, testYs],
    callbacks: tf.node.tensorBoard(PATHS.logs),
  })

  model.summary()

  console.log(chalk.green('✅ Model trained'))
  await model.save(`file://${PATHS.model}`)
}

trainModel().then(() => console.log(chalk.green('🎉 Training completed')))
