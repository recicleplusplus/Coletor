import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { useContext } from "react";
import { Provider as PaperProvider } from 'react-native-paper';

import { Colors, Theme } from "../constants/setting";
import { ColetorContext } from "../contexts/coletor/context";
import { TabsRoutes } from "./tab.routes";
import { LogRoutes } from "./log.routes";
import React from "react";
 
function Routes(){
    const MyTheme = {
        ...DefaultTheme,
        colors: {
            ...DefaultTheme.colors,
            primary: Colors[Theme][2],
            background: Colors[Theme][1]
        }
    };

    const {coletorState: {logged}, coletorDispach} = useContext(ColetorContext);

    return (
        <PaperProvider>
            <NavigationContainer theme={MyTheme}>
                {logged ? <TabsRoutes/> : <LogRoutes/>}
            </NavigationContainer>
        </PaperProvider>
    )
}

export {Routes}