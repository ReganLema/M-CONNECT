import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AllScreen from "../screens/market/AllScreen";
import VegetablesScreen from "../screens/market/VegetablesScreen";
import FruitsScreen from "../screens/market/FruitsScreen";
import LivestockScreen from "../screens/market/LivestockScreen";
import CerealsScreen from "../screens/market/CerealsScreen";
import PoultryScreen from "../screens/market/PoultryScreen";
import SeedsScreen from "../screens/market/SeedsScreen";

const Stack = createNativeStackNavigator();

export default function MarketStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="All" component={AllScreen} />

      <Stack.Screen name="Vegetables" component={VegetablesScreen} />
      <Stack.Screen name="Fruits" component={FruitsScreen} />
      <Stack.Screen name="Livestock" component={LivestockScreen} />
      <Stack.Screen name="Cereals" component={CerealsScreen} />
      <Stack.Screen name="Poultry" component={PoultryScreen} />
      <Stack.Screen name="Seeds" component={SeedsScreen} />
    </Stack.Navigator>
  );
}
