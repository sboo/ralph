import { database, Pet } from '@core/database';
import notifee, { EventType } from '@notifee/react-native';
import { useCallback } from 'react';

const useNotifications = () => {
  const NOTIFICATION_PREFIX = 'eu.sboo.ralph.reminder_';

  const getNotificationId = useCallback((petId: string) => {
    return `${NOTIFICATION_PREFIX}${petId}`;
  }, []);

  const getPetIdFromNotificationId = useCallback((notificationId: string) => {
    if (!notificationId.startsWith(NOTIFICATION_PREFIX)) {
      return undefined;
    }
    return notificationId.replace(NOTIFICATION_PREFIX, '');
  }, []);

  const enableNotificationDot = useCallback(
      (petId: string) => {
        database.write(async () => {
          const pet = await database.get<Pet>('pets').find(petId);
          if (pet && !pet.isActive) {
            pet.showNotificationDot = true;
          }
        }
        );
      },
      [database],
    );

  const onForegroundNotification = useCallback(async () => {
    return notifee.onForegroundEvent(({ type, detail }) => {
      switch (type) {
        case EventType.DISMISSED:
          console.log('User dismissed notification', detail.notification);
          break;
        case EventType.PRESS:
          if (detail?.notification?.id) {
            const petId = getPetIdFromNotificationId(detail.notification.id);
            if (petId) {
              enableNotificationDot(petId);
            }
          }
          break;
      }
    });
  }, [getPetIdFromNotificationId, enableNotificationDot]);

  const getInitialNotification = async () => {
    return await notifee.getInitialNotification();
  };

  return {
    getNotificationId,
    getPetIdFromNotificationId,
    getInitialNotification,
    onForegroundNotification,
  };
};

export default useNotifications;
