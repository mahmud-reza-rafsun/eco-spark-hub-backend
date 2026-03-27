import { v2 as cloudinary, UploadApiResponse } from "cloudinary"
import status from "http-status";
import { AppError } from "../shared/errors/app-error";


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

export const uploadFileToCloudinary = async (
    buffer: Buffer,
    fileName: string,

): Promise<UploadApiResponse> => {
    if (!buffer || !fileName) {
        throw new AppError(status.BAD_REQUEST, "File Buffer and file name are required for upload")
    }


    const extension = fileName.split(".").pop()?.toLowerCase();

    const fileNameWithOutExtension = fileName
        .split(".")
        .slice(0, -1)
        .join(".")
        .toLowerCase()
        .replace(/\s+/g, "-")
        // eslint-disable-next-line no-useless-escape
        .replace(/[^a-z0-9\-]/g, "");

    const uniqueName = Math.random().toString(36).substring(2, 7) +
        "-" + Date.now() + "-" + fileNameWithOutExtension;

    const folderPath = extension === "pdf" ? "pdfs" : "images";

    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({
            resource_type: "auto",
            public_id: `ecospark-hub/${folderPath}/${uniqueName}`,
            folder: `ecospark-hub/${folderPath}`,
        },
            (error, result) => {
                if (error) {
                    return reject(new AppError(status.INTERNAL_SERVER_ERROR, "Faield to upload file to cloudinary"))
                }
                resolve(result as UploadApiResponse)
            }
        ).end(buffer);
    })
}

export const deleteImageFromCloudinary = async (url: string) => {
    try {
        const regex = /\/v\d+\/(.+?)\.[a-zA-Z0-9]+$/;
        const match = url.match(regex);

        if (match && match[0]) {
            const public_id = match[1];

            await cloudinary.uploader.destroy(
                public_id, {
                resource_type: "image"
            }
            )
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.log(error.message)
        throw new AppError(status.INTERNAL_SERVER_ERROR, "faield to delete file from cloudinary..!!")
    }
}

export const cloudenaryUpload = cloudinary;