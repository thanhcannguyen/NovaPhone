import axiosInstance from "./axiosInstance";

export const sendChatMessage = async (message, history = []) => {
    const response = await axiosInstance.post("/chat", {
        message,
        history,
    });

    return response.data;
};