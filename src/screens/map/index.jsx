import React from 'react';
import { View } from 'react-native';
import { useGetRecyclable } from './hook/useGetRecyclable';
import { useGetUserLocation } from './hook/useGetUserLocation';
import { Loading } from '../../components/loading';
import { Error } from '../../components/error';
import MapPageContent from './map_page_content';

export default function Map() {
	const { data: userLocation, isLoading: loadingLocation, error: erroLocation } = useGetUserLocation();
	const { data: recyclable, isLoading: loadingRecyclable, error: recyclableError } = useGetRecyclable();
	

	if (loadingLocation || loadingRecyclable) {
		return <Loading />;
	}

	if (erroLocation || recyclableError) {
		return <Error error={erroLocation || recyclableError} />;
	}

	return (
		<View style={{ flex: 1 }}>
			<MapPageContent userLocation={userLocation} recyclables={recyclable} />
		</View>
	);
}
