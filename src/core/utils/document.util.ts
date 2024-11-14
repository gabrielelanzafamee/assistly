import * as textract from 'textract';

export const extractTextFromFile = async (
	file: Express.Multer.File,
): Promise<string> => {
	return new Promise((resolve, reject) => {
		textract.fromBufferWithMime(file.mimetype, file.buffer, (error, text) => {
			if (error) {
				reject(error);
			} else {
				resolve(text);
			}
		});
	});
};
