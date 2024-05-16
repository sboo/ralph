import * as RNFS from '@dr.pogodin/react-native-fs';
import {Platform} from 'react-native';

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
