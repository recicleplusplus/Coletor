import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { ChatScreen } from '../screens/chat';

const Stack = createNativeStackNavigator();

import { Home } from '../screens/home';
import Mapa from '../screens/map';

function StackCollection() {
  return (
    <Stack.Navigator initialRouteName='Home'>
      <Stack.Screen
        name="Home"
        component={Home}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Mapa"
        component={Mapa}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>

  );
}

export { StackCollection };
