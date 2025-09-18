import React, { useState, useContext } from 'react';
import { View } from 'react-native';
import { Colors, Theme } from '../../constants/setting';
import { RecyclableCard } from './components/recyclable_card';
import { Loading } from '../../components/loading';
import { Error } from '../../components/error';
import { ButtonIcon as ButtonIconComponent } from '../../components/buttons';
import { RecyclableList } from './components/recyclable_list';
import { ColetorContext } from '../../contexts/coletor/context';
import { WebView } from 'react-native-webview';
import { htmlMap } from './htmlMap';
import { UserLocation } from './models';
import { useWebViewMap } from './hook/useWebViewMap';

// Tipagem para o ButtonIcon
const ButtonIcon = ButtonIconComponent as any;

type MapPageContentProps = {
	userLocation: UserLocation;
	recyclables: any;
};

export default function MapPageContent({ userLocation, recyclables }: MapPageContentProps) {
	const { webviewRef, handleMapMessage, sendMarkersToMap, handleWebViewLoad } = useWebViewMap({ userLocation, recyclables });
	const { coletorState } = useContext(ColetorContext);
	const [error, setError] = useState<{ title?: string; content?: string } | false>(false);
	const [loading, setLoading] = useState(false);
	const [addRecyclable, setAddRecyclable] = useState(false);
	const [listRecyclable, setListRecyclable] = useState(false);
	const [currentRecyclable, setCurrentRecyclable] = useState({});

	function showRecyclable(current: any) {
		setCurrentRecyclable(current);
		setAddRecyclable(true);
	}

	return (
		<View style={{ flex: 1 }}>
			{loading && <Loading />}
			{error && <Error error={error} closeFunc={() => setError(false)} />}
			{addRecyclable && (
				<RecyclableCard
					data={currentRecyclable}
					collector={coletorState}
					callbackError={setError}
					closeCard={() => setAddRecyclable(false)}
					setloading={setLoading}
				/>
			)}
			{listRecyclable && (
				<RecyclableList
					datas={recyclables}
					collector={coletorState}
					showRecyclable={showRecyclable}
					currentLocation={userLocation}
					setError={setError}
					setLoading={setLoading}
					closeList={() => setListRecyclable(false)}
				/>
			)}
			<WebView
				ref={webviewRef}
				originWhitelist={['*']}
				source={{ html: htmlMap }}
				javaScriptEnabled={true}
				onLoad={handleWebViewLoad}
				onMessage={(event) => {
					const message = JSON.parse(event.nativeEvent.data);
					if (message.type === "marker_click") {
						const item = message.item;
						if (item.status === 'pending' || item.collector.id === coletorState.id) {
							setCurrentRecyclable({ id: message.id, ...item });
							setAddRecyclable(true);
						} else {
							setError({
								title: "Indisponível",
								content: "Esta coleta já foi selecionada por outro coletor."
							});
						}
					}
				}}
			/>
			<View style={{ position: 'absolute', bottom: 20, right: 20, zIndex: 999 }}>
				<ButtonIcon
					btn={true}
					name="menu"
					size={35}
					color={Colors[Theme][4]}
					fun={() => setListRecyclable(true)}
				/>
			</View>
		</View>
	);
}

