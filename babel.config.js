/*
 * @Description: 别名，antd, 删除console
 * @Author: wangzhicheng
 * @Date: 2021-03-04 18:48:42
 */
module.exports = api => {
  const babelEnv = api.env();
  const plugins = [
    ["import", { "libraryName": "@ant-design/react-native" }],
    [
      'module-resolver',
      {
        root:['./src'],
        alias:{
          '@': './src',
        }
      }
    ]
  ]
  if (babelEnv !== 'development') {
    plugins.push(['transform-remove-console', {exclude: ['error', 'warn']}]);
  }
  
  return {
    presets: ['module:metro-react-native-babel-preset'],
    plugins,
  }
}
