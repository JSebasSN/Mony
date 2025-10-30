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
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: "#94a3b8",
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: '#ffffff',
          borderBottomWidth: 1,
          borderBottomColor: '#e2e8f0',
        },
        headerTitleStyle: {
          fontSize: 20,
          fontWeight: '700',
          color: '#0f172a',
        },
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
