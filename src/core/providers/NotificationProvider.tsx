import useNotifications from '@/features/notifications/hooks/useNotifications';
import { database } from '@core/database';
import { Pet } from '@core/database/models/Pet';
import React, { ReactNode, useCallback, useEffect, useState } from 'react';

interface NotificationProviderProps {
  children: ReactNode;
}

/**
 * NotificationProvider handles notification setup and reactions
 */
export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  // Get notification utilities from custom hook
  const {
    getInitialNotification,
    onForegroundNotification,
    getPetIdFromNotificationId,
  } = useNotifications();

  // State to track handled notifications
  const [handledInitialNotificationId, setHandledInitialNotificationId] =
    useState<string | undefined>();

  // Enable notification dot for a pet when notification received
  const enableNotificationDot = useCallback(
    (petId: string) => {
      database.write(async () => {
        const pet = await database.get<Pet>('pets').find(petId);
        if (pet && !pet.isActive) {
          pet.showNotificationDot = true;
        }
      });
    },
    [database],
  );

  // Handle initial notifications on app launch
  useEffect(() => {
    const consumeInitialNotification = async () => {
      const initialNotification = await getInitialNotification();
      if (initialNotification?.notification.id !== handledInitialNotificationId) {
        if (initialNotification?.notification.id) {
          const petId = getPetIdFromNotificationId(
            initialNotification.notification.id,
          );
          if (petId) {
            enableNotificationDot(petId);
          }
        }
        setHandledInitialNotificationId(initialNotification?.notification.id);
      }
    };

    consumeInitialNotification();
    onForegroundNotification();
  }, [
    getInitialNotification,
    onForegroundNotification,
    getPetIdFromNotificationId,
    enableNotificationDot,
    handledInitialNotificationId,
  ]);

  return <>{children}</>;
};

export default NotificationProvider;