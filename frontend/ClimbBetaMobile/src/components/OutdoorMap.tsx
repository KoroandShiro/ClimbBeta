import { Platform } from 'react-native';
import OutdoorMapWeb from './OutdoorMap.web';
import OutdoorMapNative from './OutdoorMap.native';

const OutdoorMap = Platform.OS === 'web' ? OutdoorMapWeb : OutdoorMapNative;

export default OutdoorMap;
