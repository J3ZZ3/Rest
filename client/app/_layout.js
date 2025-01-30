import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';

export default function Layout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen 
          name="index" 
          options={{ 
            title: "Login",
            headerShown: false 
          }} 
        />
        <Stack.Screen 
          name="register" 
          options={{ 
            title: "Register",
            headerShown: false 
          }} 
        />
        <Stack.Screen 
          name="restaurants" 
          options={{ 
            title: "Restaurants",
            headerBackVisible: false 
          }} 
        />
        <Stack.Screen 
          name="RestaurantDetail" 
          options={{ 
            title: "Restaurant Details",
            headerShown: true 
          }} 
        />
        <Stack.Screen 
          name="UserReservations" 
          options={{ 
            title: "My Reservations",
            headerShown: true 
          }} 
        />
        <Stack.Screen 
          name="ReservationDetail" 
          options={{ 
            title: "Reservation Details",
            headerShown: true 
          }} 
        />
      </Stack>
    </AuthProvider>
  );
} 