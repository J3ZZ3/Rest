import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { FAB } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';

export default function RestaurantListScreen() {
  const { token, logout } = useAuth();
  const { userId, userEmail, userName } = useLocalSearchParams();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        console.log('Fetching restaurants with token:', token);
        const response = await axios.get('https://restaurant-server-5htc.onrender.com/api/restaurants', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('Restaurant data received:', response.data);
        setRestaurants(response.data);
        setError(null);
      } catch (error) {
        console.error('Error details:', error.response || error);
        setError(error.response?.data?.message || 'Failed to fetch restaurants');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();

    
  }, [token, navigation]);

  const handleLogout = async () => {
    await logout();
    navigation.replace('/');
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!restaurants || restaurants.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text>No restaurants found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={restaurants}
        keyExtractor={(item) => item._id?.toString() || Math.random().toString()}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.restaurantItem} 
            onPress={() => navigation.navigate('RestaurantDetail', { 
              restaurantId: item._id, 
              token,
              userId,
              userEmail,
              userName
            })}
          >
            <Text style={styles.restaurantName}>{item.name || 'Unnamed Restaurant'}</Text>
            <Text>{item.cuisine || 'Cuisine not specified'}</Text>
            <Text>{item.location || 'Location not specified'}</Text>
          </TouchableOpacity>
        )}
      />
      <FAB
        style={styles.fab}
        icon="book"
        onPress={() => navigation.navigate('UserReservations', { 
          userId, 
          token,
          userEmail,
          userName 
        })}
      />
      <TouchableOpacity 
        style={styles.logoutButton} 
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  restaurantItem: {
    marginBottom: 12,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  logoutButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 10,
    backgroundColor: '#ff5733',
    borderRadius: 5,
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
  },
}); 