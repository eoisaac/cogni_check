import * as tf from '@tensorflow/tfjs-node'
import { Buffer } from 'buffer'
import * as path from 'path'

const PATHS = {
  model: path.join(__dirname, '/t3-model'),
}

const classMap = { 0: 'Saudável', 1: 'Com Transtornos' }

const processImage = async (imageBase64: string) => {
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
  const buffer = Buffer.from(base64Data, 'base64')

  const imageTensor = tf.node
    .decodeImage(buffer, 3)
    .resizeBilinear([180, 180])
    .toFloat()
    .div(tf.scalar(255.0))
  return imageTensor.expandDims(0)
}

export const predictImage = async (imageBase64: string) => {
  const model = await tf.loadLayersModel(`file://${PATHS.model}/model.json`)

  const imageTensor = await processImage(imageBase64)
  const predictions = model.predict(imageTensor) as tf.Tensor

  const predictionArray = predictions.arraySync() as number[][]
  const probability = predictionArray[0][0]
  const predictedClass = probability > 0.5 ? 1 : 0

  return {
    probability,
    predictedClass: classMap[predictedClass],
  }
}
