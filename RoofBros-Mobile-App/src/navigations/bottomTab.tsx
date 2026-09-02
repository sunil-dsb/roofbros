import React from 'react';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import BottomBar from '../components/bottomBar';
import { routesConstants } from './routeConstants';
import { Jobs, Colours, Profile } from '../screens';
import { View } from 'react-native';
import { navigate } from './navigationServices';

const Tab = createBottomTabNavigator();

const renderTabBar = (props: BottomTabBarProps) => <BottomBar {...props} />;

const BottomTab = () => {
  return (
    <Tab.Navigator
      tabBar={renderTabBar}
      screenOptions={{
        headerShown: false,
      }}
      backBehavior="history"
      initialRouteName={routesConstants.jobs}
    >
      <Tab.Screen
        name={routesConstants.jobs}
        component={Jobs}
      />
      <Tab.Screen
        name="NewTab"
        component={View}
        options={{ tabBarLabel: 'New' }}
        listeners={() => ({
          tabPress: (e) => {
            e.preventDefault();
            navigate(routesConstants.newJob);
          },
        })}
      />
      <Tab.Screen
        name={routesConstants.colours}
        component={Colours}
      />
      <Tab.Screen
        name={routesConstants.profile}
        component={Profile}
      />
    </Tab.Navigator>
  );
};

export default BottomTab;
