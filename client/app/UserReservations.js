import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';

const UserReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { token } = useAuth();

  const fetchReservations = async () => {
    try {
      const response = await axios.get(
        'https://restaurant-server-5htc.onrender.com/api/reservations',
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setReservations(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching reservations:', err);
      setError('Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [token]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={reservations}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.reservationCard}
            onPress={() => router.push(`/ReservationDetail?id=${item._id}`)}
          >
            <Text style={styles.restaurantName}>{item.restaurantId.name}</Text>
            <Text>Date: {new Date(item.date).toLocaleDateString()}</Text>
            <Text>Time: {item.timeSlot}</Text>
            <Text>Status: {item.status}</Text>
            <Text>Payment: {item.paymentStatus}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  reservationCard: {
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
  error: {
    color: 'red',
    textAlign: 'center',
  },
});

export default UserReservations; 