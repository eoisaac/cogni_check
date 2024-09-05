import { CloudUpload, createIcons } from 'lucide'
import { serverInstance } from './libs/axios'
import './styles.css'

createIcons({ icons: { CloudUpload } })

const form = document.querySelector('form')!
const submitBtn = document.getElementById('submit-btn') as HTMLButtonElement
const toast = document.getElementById('toast')!
const resultDiv = document.getElementById('result')!
const uploadedImage = document.getElementById(
  'uploaded-image',
) as HTMLImageElement
const predictionResult = document.getElementById('prediction-result')!
const uploadAnotherBtn = document.getElementById('upload-another-btn')!

const IMAGE_FILE_TYPES = ['image/png', 'image/jpeg', 'image/jpg']

interface PredictResponse {
  prediction: {
    probability: number
    predictedClass: string
  }
}

const doPredictReq = async (base64: string) => {
  const res = await serverInstance.post('/predict', { image: base64 })
  return res.data as PredictResponse
}

const showToast = (message: string, duration = 3000) => {
  toast.textContent = message
  toast.classList.remove('hidden')
  setTimeout(() => {
    toast.classList.add('hidden')
  }, duration)
}

const validateFile = (file: File | null): string | null => {
  if (!file) return 'Nenhum arquivo selecionado'
  if (!IMAGE_FILE_TYPES.includes(file.type))
    return 'Tipo de arquivo inválido. Por favor, selecione um arquivo de imagem (png, jpeg, jpg)'
  return null
}

const convertFileToBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

const handleFormSubmit = async (e: Event) => {
  e.preventDefault()

  const data = new FormData(form)
  const file = data.get('image-file') as File

  const errorMessage = validateFile(file)
  if (errorMessage) return showToast(errorMessage)

  submitBtn.disabled = true
  submitBtn.textContent = 'Carregando...'

  try {
    const fileBase64 = await convertFileToBase64(file)

    const result = await doPredictReq(fileBase64)

    uploadedImage.src = fileBase64
    predictionResult.textContent = `Classe: ${result.prediction.predictedClass}, Probabilidade: ${result.prediction.probability}`
    form.classList.add('hidden')
    resultDiv.classList.remove('hidden')
  } catch (error) {
    showToast('Erro ao realizar a previsão')
  } finally {
    submitBtn.disabled = false
    submitBtn.textContent = 'Enviar'
  }
}

const handleUploadAnother = () => {
  form.classList.remove('hidden')
  resultDiv.classList.add('hidden')
  form.reset()
}

form.addEventListener('submit', handleFormSubmit)
uploadAnotherBtn.addEventListener('click', handleUploadAnother)
