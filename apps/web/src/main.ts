import { CloudUpload, createIcons } from "lucide";
import { serverInstance } from "./libs/axios";
import "./styles.css";

createIcons({
  icons: {
    CloudUpload,
  },
});

const form = document.querySelector("form")!;

const IMAGE_FILE_TYPES = ["image/png", "image/jpeg", "image/jpg"];

const doPredictReq = async (base64: string) => {
  const res = await serverInstance.post("/predict", { image: base64 });
  return res.data;
};

const convertFileToBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const handleFormSubmit = async (e: Event) => {
  e.preventDefault();

  const data = new FormData(form);
  const file = data.get("image-file") as File;

  // @todo - implement toast messages
  // @todo - crate a separated method to validate?
  // @todo - disable button while loading or when has no file
  // @todo - display the original image with the prediction
  if (!file) return console.log("No file selected");
  if (!IMAGE_FILE_TYPES.includes(file.type))
    return console.log(`Invalid file type: ${file.type}`);

  const fileBase64 = await convertFileToBase64(file);

  const result = await doPredictReq(fileBase64);
  console.log(result);
};

form.addEventListener("submit", handleFormSubmit);
