import React from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Pagination, PaginationProps } from 'react-native-swiper-flatlist';

const styles = StyleSheet.create({
  paginationContainer: {
    marginBottom: 25,
  },
  pagination: {
    borderRadius: 7,
    height: 7,
    width: 7,
  },
});

export const CustomPagination = (props: JSX.IntrinsicAttributes & PaginationProps) => {

    const theme = useTheme();

  return (
    <Pagination
      {...props}
      paginationStyle={styles.paginationContainer}
      paginationStyleItem={styles.pagination}
      paginationDefaultColor={theme.colors.onSecondaryContainer}
      paginationActiveColor={theme.colors.secondaryContainer}
    />
  );
};