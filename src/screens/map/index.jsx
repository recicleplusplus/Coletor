import React, { useState, useEffect} from 'react';
import { View } from 'react-native';
import { useGetRecyclable } from './hook/useGetRecyclable';
import { GetRecyclable } from '../../firebase/providers/recyclable';
import { useGetUserLocation } from './hook/useGetUserLocation';
import { Loading } from '../../components/loading';
import { Error } from '../../components/error';
import MapPageContent from './map_page_content';

export default function Map() {
	const { data: userLocation, isLoading: loadingLocation, error: erroLocation } = useGetUserLocation();
	const [recyclable, setRecyclable] = useState({});
	useEffect(() => {
		GetRecyclable(setRecyclable);
	}, []);


	if (loadingLocation) {
		return <Loading />;
	}

	if (erroLocation) {
		return <Error error={erroLocation} />;
	}

	return (
		<View style={{ flex: 1 }}>
			<MapPageContent userLocation={userLocation} recyclables={recyclable} />
		</View>
	);
}
