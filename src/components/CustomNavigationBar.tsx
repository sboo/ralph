import {Appbar} from 'react-native-paper';
import {getHeaderTitle} from '@react-navigation/elements';
import React from 'react';
import {NativeStackHeaderProps} from '@react-navigation/native-stack';

const CustomNavigationBar: React.FC<NativeStackHeaderProps> = ({
  navigation,
  route,
  options,
  back,
}) => {
  const title = getHeaderTitle(options, route.name);

  return (
    <Appbar.Header style={options.headerStyle}>
      {back ? <Appbar.BackAction onPress={navigation.goBack} /> : null}
      <Appbar.Content title={title} />
      <Appbar.Action
        icon="cog-outline"
        onPress={() => navigation.navigate('Welcome')}
      />
    </Appbar.Header>
  );
};
export default CustomNavigationBar;
