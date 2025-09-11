
export const getValidImageUrl = (url) => {
    if (!url || typeof url !== 'string' || url === 'none') {
        return require('../../assets/images/profile.jpg'); // Retorna imagem padrão
    }
    return url;
};