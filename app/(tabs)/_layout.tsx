import { Tabs } from "expo-router";
import { List, PieChart, UserCircle } from "lucide-react-native";
import React from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function TabLayout() {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#2d4a7c",
        headerShown: true,
      }}
    >
      <Tabs.Screen
        name="movements"
        options={{
          title: "Movimientos",
          tabBarIcon: ({ color }) => <List color={color} size={24} />,
        }}
      />
      
      {isAdmin && (
        <Tabs.Screen
          name="balance"
          options={{
            title: "Balance",
            tabBarIcon: ({ color }) => <PieChart color={color} size={24} />,
          }}
        />
      )}
      
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color }) => <UserCircle color={color} size={24} />,
        }}
      />
      
      <Tabs.Screen
        name="users"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
