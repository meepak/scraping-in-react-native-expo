import { Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';

const saveFile = async (fileData, fileName) => {
  try {
    const directoryUri = FileSystem.documentDirectory;
    const fileUri = `${directoryUri}${fileName}`;
    console.log('Saving to file -- ' + fileUri);

    await FileSystem.writeAsStringAsync(fileUri, fileData, { encoding: FileSystem.EncodingType.Base64 });

    return fileUri; // Return the local file path
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const downloadFile = async (downloadUrl, fileName) => {
  try {
    let mimeType = 'text/csv'; // Default mime
    if (fileName.includes('.pdf')) {
      mimeType = 'application/pdf';
    }

    const response = await fetch(downloadUrl, {
      headers: {
        Accept: mimeType,
      },
    });

    if (response.ok) {
      const fileData = await response.text();
      console.log('File Data:', fileData);
      const localFilePath = await saveFile(fileData, fileName);

      if (localFilePath) {
        // You can do something with the localFilePath here
        return localFilePath;
      } else {
        Alert.alert('Error', 'Could not save the file');
      }
    } else {
      // Handle the case where the server did not return a successful response
      console.log('Server response was not successful:', response.status, response.statusText);
      Alert.alert('Error', 'Could not download the file');
    }
  } catch (error) {
    console.log(error);
    Alert.alert('Error', 'Error Downloading File!!');
  }
};


// Example usage:
// downloadFile('https://example.com/report.pdf', 'pdf', 'MyPDFFile.pdf');
// downloadFile('https://example.com/report.csv', 'csv', 'MyCSVFile.csv');


// const requestFileWritePermission = async () => {
//   const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
//   console.log(permissions.granted);
//   if (!permissions.granted) {
//     console.log('File write Permissions Denied!!');
//     return {
//       access: false,
//       directoryUri: null,
//     };
//   }
//   return {
//     access: true,
//     directoryUri: permissions.directoryUri,
//   };
// };

// const getTemporaryDirectory = () => {
//     return FileSystem.cacheDirectory;
//   };

// const saveFile = async (fileData, directoryUri, fileName, mimeType = 'text/csv') => {
//   try {
//     const fileUri = `${directoryUri}/${fileName}`;
//     await FileSystem.StorageAccessFramework.createFileAsync(fileUri, mimeType);
//     await FileSystem.writeAsStringAsync(fileUri, fileData, { encoding: FileSystem.EncodingType.Base64 });
//     console.log(fileUri);
//     return fileUri;
//   } catch (error) {
//     console.log(error);
//     return null;
//   }
// };

// export const downloadFile = (downloadUrl, fileType, fileName) => {
//   fetch(downloadUrl)
//     .then(async (response) => {
//       const fileData = await response.blob();
//       const hasPermissions = await requestFileWritePermission();
//       if (hasPermissions.access) {
//         const localFilePath = await saveFile(fileData, hasPermissions.directoryUri, fileName, fileType === 'pdf' ? 'application/pdf' : 'text/csv');
//         if (localFilePath) {
//           console.log(`File saved at: ${localFilePath}`);
//         } else {
//           Alert.alert('Error', 'Could not save the file');
//         }
//       } else {
//         Alert.alert('Error', 'File write permissions denied');
//       }
//     })
//     .catch((error) => {
//       console.log(error);
//       Alert.alert('Error', 'Error Downloading File!!');
//     });
// }


// // Example usage:
// //fetchReportForm('https://example.com/report.pdf', 'pdf', 'MyPDFFile.pdf');
// //fetchReportForm('https://example.com/report.csv', 'csv', 'MyCSVFile.csv');
