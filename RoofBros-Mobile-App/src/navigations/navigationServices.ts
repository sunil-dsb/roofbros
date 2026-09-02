import * as React from 'react';
import { CommonActions, StackActions } from '@react-navigation/native';
import { routesConstants } from './routeConstants';

export const navigationRef: any = React.createRef();

let navigator: any;

export const navigate = (
  path: string | { name: string; params?: object; merge?: boolean },
  params?: object
) => {
  if (typeof path === 'string') {
    navigationRef.current?.navigate(path, params);
  } else {
    navigationRef.current?.navigate(path);
  }
};

export const goBack = () => {
  navigationRef.current?.goBack();
};

export const reset = (name: string, index: number = 0) => {
  navigationRef.current?.dispatch(
    CommonActions.reset({
      index: index,
      routes: [
        {
          name: name,
        },
      ],
    })
  );
};

export const resetToRoute = (
  targetRoute: string,
  params?: object,
  baseRoute: string = routesConstants.bottomTab
) => {
  navigationRef.current?.dispatch(
    CommonActions.reset({
      index: 1,
      routes: [{ name: baseRoute }, { name: targetRoute, params }],
    })
  );
};

export const setNavigator = (nav: any) => {
  navigator = nav;
};

export const getCurrentRoute = () => {
  const route = navigationRef?.current?.getCurrentRoute();
  return route?.name;
};

export const popToTop = () => {
  navigationRef.current?.dispatch(StackActions.popToTop());
};
