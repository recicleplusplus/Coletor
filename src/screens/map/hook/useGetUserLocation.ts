import { useState, useEffect, useCallback } from 'react';
import { requestForegroundPermissionsAsync, getCurrentPositionAsync } from 'expo-location';
import { UserLocation } from '../models';

interface Output {
	data: UserLocation | null;
	error: Error | null;
	isLoading: boolean;
	refetch: () => Promise<void>;
}

export function useGetUserLocation(): Output {
	const [data, setData] = useState<UserLocation | null>(null);
	const [error, setError] = useState<Error | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const fetchUserLocation = useCallback(async (): Promise<void> => {
		try {
			setIsLoading(true);
			setError(null);

			const { status } = await requestForegroundPermissionsAsync();

			if (status !== 'granted') {
				throw new Error('Permission to access location was denied');
			}

			const location = await getCurrentPositionAsync({
				accuracy: 6,
			});

			setData({
				latitude: location.coords.latitude,
				longitude: location.coords.longitude,
			});
		} catch (err) {
			const errorMessage = err instanceof Error ? err : new Error('Failed to get user location');
			setError(errorMessage);
			setData(null);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchUserLocation();
	}, [fetchUserLocation]);

	return {
		data,
		error,
		isLoading,
		refetch: fetchUserLocation,
	};
}