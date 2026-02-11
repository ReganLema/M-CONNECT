import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import BuyerTabs from "./BuyerTabs";
import FarmerTabs from "./FarmerTabs";
import { useUser } from "../contexts/UserContext";

export default function RoleNavigator() {
  const { user } = useUser();

  // TEMP fallback (until auth ready)
  const role = user?.role || "buyer"; // "buyer" | "farmer"

  console.log("ACTIVE ROLE:", user?.role);

  return (
    <NavigationContainer>
      {role === "farmer" ? <FarmerTabs /> : <BuyerTabs />}
    </NavigationContainer>
  );
}
