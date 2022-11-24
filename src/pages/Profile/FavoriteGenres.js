import React, { useEffect, useCallback, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Button,
  Dimensions,
  ScrollView,
  StatusBar,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import Constants from "../../components/utilities/Constants";
import styled from "styled-components/native";
import { useFonts } from "expo-font";
import { Feather } from "@expo/vector-icons";
import Modal from "react-native-modal";
import { connect } from "react-redux";
import { FontAwesome5 } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import LoovieLogo from '../../icons/LoovieLogo.svg';
import { getAuth } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getFirestore,
  getDocs,
  query,
  where,
  updateDoc
} from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "../../../firebase-config";
import ExpoFastImage from "expo-fast-image";

const GenreItem = styled.TouchableOpacity`
  border-color: ${props=>props.selected?'#9D0208':'#0F0C0C'};
  alignItems: center;
  border-width: 4px;
  border-radius: 10px;
  width: ${(Dimensions.get("window").width * 184) / 392.72}px;
  height: ${(Dimensions.get("window").width * 127) / 392.72}px;
  marginBottom: ${(Dimensions.get("window").width * 5) / 392.72}px;
`;

export default function FavoriteGenres({ navigation, route, props }) {
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);
  const [genres, setGenres] = useState([]);
  const [oldGenres, setOldGenres] = useState([]);
  const [favoriteGenres, setFavoriteGenres] = useState([]);
  const [username, setUsername] = useState("");

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const [fontsLoaded] = useFonts({
    "Lato-Regular": require("../../../assets/fonts/Lato-Regular.ttf"),
    "Lato-Bold": require("../../../assets/fonts/Lato-Bold.ttf"),
  });

  const toggleChip = (index, selected) => {
    if(selected == true) {
      let selecteds = [...genres]
      selecteds[index].selected = !selecteds[index].selected;
      setGenres(selecteds);
      console.log(genres[index]);
    }
    const selectedGenres = [];
    genres.map((genre)=>{
      if(genre.selected == true) {
        selectedGenres.push(genre)
      }
    });
    console.log(selectedGenres.length)
    if(selected == false) {
      let selecteds = [...genres]
      selecteds[index].selected = !selecteds[index].selected;
      setGenres(selecteds);
      console.log(genres[index]);
    }
  };

  const handleSubmit = async () => {
    let selectedGenres = [];
    genres.map((genre)=>{
      if(genre.selected == true) {
        selectedGenres.push(genre)
      }
    });
    console.log(selectedGenres);
    if(selectedGenres.length == 0) {
      setModalVisible(true);
    }
    else {
      await updateDoc(doc(collection(db, "userPreferences"), auth.currentUser.uid), {
        favoriteGenres: selectedGenres })
      .catch(error => console.log(error.code))
      .finally(()=>{
        navigation.navigate("ProfileScreen")
      })
    }
  }

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  const sla = async () => {

    const docRefGenre = doc(db, "userPreferences", auth.currentUser.uid);
    const docSnapGenre = await getDoc(docRefGenre);

    if (docSnapGenre.exists()) {
      
    } else {
      // doc.data() will be undefined in this case
      console.log("No such document!");
      setFavoriteGenres("");
    }
    const data = docSnapGenre.data();
    const favoriteGenres = data.favoriteGenres;

    const checkFavoriteGenre = (id) => {
      return favoriteGenres.some(favoriteGenre => favoriteGenre.id == id);
    }


    const docsSnap = await getDocs(collection(db, "genres"));

    let oldGenres = [];

    docsSnap.forEach(doc => {
      setGenres(old =>[...old, {id: doc.id, genreName: doc.data().name, backdrop_path: doc.data().backdrop_path, selected: checkFavoriteGenre(doc.id)}].sort(function(a,b) {
        let x = a.genreName.toUpperCase(),
        y = b.genreName.toUpperCase();
  
        return x == y ? 0 : x > y ? 1 : -1;
      }));
    });

    console.log(genres);

    setTimeout(() => {
      console.log(genres);
      setLoading(false);
    }, 5000);
  }

  useEffect( () => {
    sla();
  }, [])

  if (!fontsLoaded) {
    return null;
  } else {
    return (
      <SafeAreaView style={styles.container}>
        {loading &&(
          <View style={styles.loadingArea}>
            <ActivityIndicator size="large" color="#FFF" />
            <Text style={styles.loadingText}>Carregando...</Text>
          </View>
        )}
        {!loading &&(
          <View style={styles.content}>
            <ScrollView>
              <View style={styles.results}>
                {genres.map((genre, index) => {
                  return(
                    <GenreItem key={genre.id} selected={genre.selected} onPress={() => toggleChip(index, genre.selected)}>
                      <ExpoFastImage
                        source={{
                          uri: `${Constants.URL.IMAGE_URL_W780}${genre.backdrop_path}`,
                        }}
                        resizeMode="cover"
                        style={styles.mediaBackdrop}
                      />
                      <View style={styles.genreNameArea}>
                        <Text style={styles.genreName}>{genre.genreName}</Text>
                      </View>
                    </GenreItem>
                      
                      
                  )
                })}
              </View>
            </ScrollView>
            <View style={styles.footer}>
              <View style={styles.footerContent}>
                <TouchableOpacity style={styles.submit} onPress={() => handleSubmit()}>
                  <Text style={styles.submitText}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Modal isVisible={isModalVisible} onSwipeComplete={() => setModalVisible(false)} swipeDirection="down" onSwipeThreshold={500} onBackdropPress={toggleModal} style={{margin: 0}}>
              <View style={styles.modalArea}>
                <View style={styles.modalContent}>
                  <TouchableOpacity style={{position:'relative', top: (Dimensions.get("window").width * -35) / 392.72, right: (Dimensions.get("window").width * -115) / 392.72}} onPress={() => setModalVisible(false)}>
                    <AntDesign name="closecircle" size={40} color="white"/>
                  </TouchableOpacity>
                  
                
                  <Text style={styles.errorMessage}>Escolha pelo menos um gênero.</Text>
                  <TouchableOpacity style={styles.closeModal} onPress={() => setModalVisible(false)}>
                    <Text style={styles.closeModalText}>OK</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </View>
        )}
        
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  errorMessage: {
    color: '#FFF',
    fontFamily: 'Lato-Regular',
    fontSize: 20,
    textAlign: 'center',
    marginBottom: (Dimensions.get("window").width * 35) / 392.72,
  },
  closeModal: {
    height: (Dimensions.get("window").width * 60) / 392.72,
    width: (Dimensions.get("window").width * 120) / 392.72,
    backgroundColor: '#FFF',
    borderColor: '#0F0C0C',
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    marginBottom: (Dimensions.get("window").width * 10) / 392.72,
  },
  closeModalText: {
    color: '#0F0C0C',
    fontSize: 20,
    fontFamily: 'Lato-Bold'
  },
  modalArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height
  },
  modalContent: {
    paddingHorizontal: 15,
    borderRadius: 25,
    height: (Dimensions.get("window").width * 250) / 392.72,
    width: (Dimensions.get("window").width * 250) / 392.72,
    backgroundColor: '#292929',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 15
  },
  submitText: {
    color: '#FFF',
    fontSize: 20,
    fontFamily: 'Lato-Bold'
  },
  submit: {
    height: (Dimensions.get("window").width * 60) / 392.72,
    width: (Dimensions.get("window").width * 170) / 392.72,
    backgroundColor: '#0F0C0C',
    borderColor: '#FFF',
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15
  },
  footer: {
    height: (Dimensions.get("window").width * 0) / 392.72,
    width: Dimensions.get("window").width,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    top: (Dimensions.get("window").width * -60) / 392.72
  },
  footerContent: {
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    height: (Dimensions.get("window").width * 125) / 392.72,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  title: {
    color: '#FFF',
    fontFamily: 'Lato-Bold',
    fontSize: 17,
  },
  text: {
    color: '#FFF',
    fontFamily: 'Lato-Regular',
    fontSize: 15,
    textAlign: 'center',
    marginTop: (Dimensions.get("window").width * 15) / 392.72,
    width: (Dimensions.get("window").width * 250) / 392.72,
  },
  mediaBackdrop: {
    width: (Dimensions.get("window").width * 178) / 392.72,
    height: (Dimensions.get("window").width * 100.125) / 392.72,
    borderRadius: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  header: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30
  },
  results: {
    paddingHorizontal: (Dimensions.get("window").width * 10) / 392.72,
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    flex: 1,
    marginBottom: (Dimensions.get("window").width * 125) / 392.72
  },
  genreName: {
    color: '#FFF',
    fontFamily: 'Lato-Regular',
    fontSize: 16,
    opacity: 1,
    marginTop: (Dimensions.get("window").width * 7.5) / 392.72,
    textAlign: 'center'
  },
  genreNameArea: {
    width: (Dimensions.get("window").width * 178) / 392.72,
    height: (Dimensions.get("window").width * 50) / 392.72,
    backgroundColor: 'rgba(0,0,0,0.95)',
    alignItems: 'center',
    position: 'relative',
    top: (Dimensions.get("window").width * -30) / 392.72,
    borderRadius: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10
  },
  loadingArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#FFF",
    fontFamily: "Lato-Regular",
  },
  container: {
    flex: 1,
    backgroundColor: '#0F0C0C',
    justifyContent: 'flex-start'
  },
  content: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-start',
    paddingTop: 20
  },
});