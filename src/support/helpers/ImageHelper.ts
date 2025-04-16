import * as RNFS from '@dr.pogodin/react-native-fs';
import { Platform } from 'react-native';

export const getImagePath = (
  filename: string,
  addAndroidFilePrepend = false,
): string => {
  const path = `${RNFS.DocumentDirectoryPath}/${filename}`;
  if (Platform.OS === 'android' && addAndroidFilePrepend) {
    return `file://${path}`;
  }
  return path;
};

export const getImageFilename = (path: string): string => {
  return path.split('/').pop() || '';
};

export const getBase64Image = async (imageName: string): Promise<string> => {
  try {
    const path = getImagePath(imageName);
    const extension = path.split('.').pop();
    let mimeType = '';
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        mimeType = 'image/jpeg';
        break;
      case 'png':
        mimeType = 'image/png';
        break;
      default:
        mimeType = 'image/jpeg';
        break;
    }
    const base64 = await RNFS.readFile(path, 'base64');
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error(error);
    return '';
  }
};
