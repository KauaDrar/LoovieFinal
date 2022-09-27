import React, { useCallback } from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { Entypo } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import LoovieLogo from '../icons/LoovieLogo.svg';

import { HomeStack, EmCartazStack, ProfileStack } from "./MainStack";
import { TouchableOpacity } from "react-native-gesture-handler";
import { ActivityIndicator, View, StyleSheet, Text } from "react-native";

const Tab = createMaterialTopTabNavigator();

SplashScreen.preventAutoHideAsync();

export default function MainTab({route}) {
  const [fontsLoaded] = useFonts({
    "Lato-Regular": require("../../assets/fonts/Lato-Regular.ttf"),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  const isTabBarVisible = (route) => {
    const routeName = route.state ? route.state.routes[route.state.index]?.name : (route.params ? route.params.screen : 'HOME');

    return[
      'DeleteAccountConfirm'
    ].includes(routeName);
  };

  if (!fontsLoaded) {
    return null;
  } else {
    return (
      <Tab.Navigator
        tabBarPosition="bottom"
        onLayout={onLayoutRootView}
        initialRouteName="HomeTab"
        screenOptions={({ route }) => ({
          swipeEnabled: isTabBarVisible(route),
          tabBarOptions: {
            showIcon: true,
            showLabel: false,
            tabBarHideOnKeyboard: true,
          },
          tabBarIndicatorStyle: {
            backgroundColor: "#9D0208",
          },
          tabBarIconStyle: {
            height: 60,
            width: 50,
            alignItems: "center",
            justifyContent: "center",
          },
          tabBarIcon: ({ focused, color, size }) => {
            let colorCode;
            let tamanhoBorda;
            let tamanhoIcone;
            colorCode = focused ? "#9D0208" : "#FFF";
            tamanhoBorda = focused ? 2 : 0;
            tamanhoIcone = focused ? 50 : 40;
            if (route.name === "HomeTab") {
              return (
                <TouchableOpacity>
                  <LoovieLogo
                    width={tamanhoIcone}
                    height={tamanhoIcone}
                    fill={colorCode}
                  />
                </TouchableOpacity>
              );
            } else if (route.name === "CinemaTab") {
              return (
                <TouchableOpacity>
                  <Entypo name="ticket" size={tamanhoIcone} color={colorCode} />
                </TouchableOpacity>
              );
            } else if (route.name === "ProfileTab") {
              return (
                <TouchableOpacity>
                  <FontAwesome name="user" size={tamanhoIcone} color={colorCode} />
                </TouchableOpacity>
              );
            }

            // You can return any component that you like here!
          },

          tabBarStyle: {
            backgroundColor: "#0F0C0C",
            borderColor: "#292929",
            borderTopWidth: 1,
          },
          tabBarLabelStyle: {
            display: "none",
          },
          headerShown: false,
        })}
      >
        <Tab.Screen name="CinemaTab" component={EmCartazStack} options={()=>({
          lazyPlaceholder: () => (
            <View style={styles.loadingArea}>
              <ActivityIndicator size="large" color="#FFF" />
              <Text style={styles.loadingText}>Carregando...</Text>
            </View>
          )
        })}/>
        <Tab.Screen name="HomeTab" component={HomeStack} />
        <Tab.Screen name="ProfileTab" component={ProfileStack} 
        options={()=>({
        })}/>
      </Tab.Navigator>
    );
  }
}
const styles = StyleSheet.create({
  loadingText: {
    color: "#FFF",
  },
  loadingArea: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#0F0C0C',
    paddingTop: 95
  },
})
