import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import App from './src/App';
import './src/utils/core'; // 引入核心文件
import { name as appName } from './app.json';
import 'moment/locale/zh-cn' 

AppRegistry.registerComponent(appName, () => App);