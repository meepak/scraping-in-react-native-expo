
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      backgroundColor: '#ECF0F1',
    },
    buttonsContainer: {
      borderTopColor: 'red',
      
      flexDirection: 'row', // This makes the buttons appear horizontally
      justifyContent: 'space-between', // You can adjust this to control the spacing between buttons
      padding: 10,
    },
    textStyle: {
      marginBottom: 8,
      color: 'white',
      fontWeight: 'bold',
      textAlign: 'center',
    },
    checkboxContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
      },
      modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
      },
      button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2,
      },
      buttonOpen: {
        backgroundColor: '#F194FF',
      },
      buttonClose: {
        backgroundColor: '#2196F3',
      },
      modalText: {
        marginBottom: 15,
        textAlign: 'center',
      },
      buttonSelectBankContainer: {
        borderTopColor: 'orange',
        
        flexDirection: 'column', 
        justifyContent: 'space-between', // You can adjust this to control the spacing between buttons
        padding: 20,
        margin: 20,
        rowGap: 10,
      },
  });

  export default styles;