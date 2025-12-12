import { apiClient } from "../lib/rpc"

export const analyzeCrop = async (imageBase64: string) => {
    const response = await apiClient.api.ai["analyze-crop"].$post({
        json: {
            imageBase64
        }
    })

    if (!response.ok) {
        throw new Error("Failed to analyze crop")
    }

    return await response.json()
}