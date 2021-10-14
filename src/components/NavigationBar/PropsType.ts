/*
 * @Description: 
 * @Author: wangzhicheng
 * @Date: 2021-03-08 15:42:54
 */
export interface NavigationPropsType {
  leading: React.ReactElement | null;
  leadingPress?: (_?: any) => void;
  trailing?: React.ReactElement | null;
  navStyle?: any;
  title?: React.ReactElement | string; // 标题
}
export interface NavigationState {}
