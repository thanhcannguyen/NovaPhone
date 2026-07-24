import axiosInstance from "./axiosInstance";

export const sendChatMessage = async (message) => {
    const response = await axiosInstance.post("/chat", {
        message,
    });

    return response.data;
};