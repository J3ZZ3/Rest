import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import { useLocalSearchParams } from 'expo-router';

const ReservationDetailScreen = () => {
  const { reservationId, token, userId, userEmail, userName } = useLocalSearchParams();
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReservationDetails = async () => {
      try {
        const response = await axios.get(`https://restaurant-server-5htc.onrender.com/api/reservations/${reservationId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setReservation(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch reservation details');
      } finally {
        setLoading(false);
      }
    };

    fetchReservationDetails();
  }, [reservationId, token]);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return <Text style={styles.errorText}>{error}</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reservation Details</Text>
      <Text>Restaurant: {reservation.restaurantId.name}</Text>
      <Text>Date: {new Date(reservation.date).toLocaleDateString()}</Text>
      <Text>Time: {reservation.timeSlot}</Text>
      <Text>Guests: {reservation.numberOfGuests}</Text>
      <Text>Status: {reservation.status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
});

export default ReservationDetailScreen; 