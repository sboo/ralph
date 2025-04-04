import {BSON} from 'realm';
import notifee, {EventType} from '@notifee/react-native';
import {useCallback} from 'react';
import usePet from '@/features/pets/hooks/usePet';

const useNotifications = () => {
  const {enableNotifcationDot} = usePet();
  const NOTIFICATION_PREFIX = 'eu.sboo.ralph.reminder_';

  const getNotificationId = useCallback((petId: BSON.ObjectId) => {
    return `${NOTIFICATION_PREFIX}${petId.toHexString()}`;
  }, []);

  const getPetIdFromNotificationId = useCallback((notificationId: string) => {
    if (!notificationId.startsWith(NOTIFICATION_PREFIX)) {
      return undefined;
    }
    return BSON.ObjectId.createFromHexString(
      notificationId.replace(NOTIFICATION_PREFIX, ''),
    );
  }, []);

  const onForegroundNotification = useCallback(async () => {
    return notifee.onForegroundEvent(({type, detail}) => {
      switch (type) {
        case EventType.DISMISSED:
          console.log('User dismissed notification', detail.notification);
          break;
        case EventType.PRESS:
          if (detail?.notification?.id) {
            const petId = getPetIdFromNotificationId(detail.notification.id);
            if (petId) {
              enableNotifcationDot(petId);
            }
          }
          break;
      }
    });
  }, [getPetIdFromNotificationId, enableNotifcationDot]);

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
