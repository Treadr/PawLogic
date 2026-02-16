# Skill: Push Notifications

## Purpose
Implement proactive push notifications for training reminders, pattern alerts, milestone celebrations, and engagement nudges using Expo Notifications + OneSignal.

## Tech Context
- **Local Notifications:** expo-notifications (on-device scheduling)
- **Remote Push:** OneSignal (server-triggered, segmentation, analytics)
- **Backend Integration:** OneSignal REST API called from FastAPI
- **Platforms:** iOS (APNs) + Android (FCM)

## Notification Categories

### 1. Training Reminders (Phase 1)
**Trigger:** User-configured schedule or BIP-based cadence
```
"Time to check in with Luna! How's her behavior been today?"
→ Deep links to quick-log flow
```

### 2. Pattern Alerts (Phase 1)
**Trigger:** Backend analytics detects a new pattern or significant change
```
"We noticed something: Luna's scratching has increased 40% this week. Tap to see what changed."
→ Deep links to insight detail
```

### 3. Logging Nudges (Phase 1)
**Trigger:** No log entry in 3+ days
```
"Luna misses your attention to her behavior! Log a quick update to keep your insights accurate."
→ Deep links to quick-log flow
```

### 4. Milestone Celebrations (Phase 2)
**Trigger:** Progress thresholds reached
```
"Amazing! Luna hasn't scratched the couch in 7 days. Your consistency is paying off!"
```

### 5. BIP Phase Advancement (Phase 2)
**Trigger:** Advancement criteria met on active BIP
```
"Luna is ready for Phase 2 of her behavior plan. Tap to see what's next."
→ Deep links to BIP detail
```

### 6. Multi-Pet Alerts (Phase 2)
**Trigger:** Inter-pet interaction pattern detected
```
"Heads up: conflicts between Luna and Duke spike around 5-6 PM. Consider separating feeding times."
→ Deep links to household insights
```

## Implementation

### Expo Notifications Setup (Mobile)
```typescript
// services/notifications.ts

import * as Notifications from 'expo-notifications';

// Request permissions on onboarding
async function registerForPushNotifications(): Promise<string | null> {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return null;

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  // Send token to backend for OneSignal registration
  await apiClient.post('/notifications/register', { push_token: token });
  return token;
}

// Handle notification received (foreground)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Handle notification tap (deep link)
Notifications.addNotificationResponseReceivedListener((response) => {
  const data = response.notification.request.content.data;
  if (data.screen) {
    navigation.navigate(data.screen, data.params);
  }
});
```

### Local Notification Scheduling
```typescript
// Schedule daily logging reminder
async function scheduleLoggingReminder(hour: number, minute: number) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Time for a check-in!",
      body: "How has your pet been today? Log a quick update.",
      data: { screen: 'ABCLogging' },
    },
    trigger: {
      type: 'daily',
      hour,
      minute,
    },
  });
}
```

### OneSignal Backend Integration
```python
# app/services/notification_service.py

import httpx

class NotificationService:
    def __init__(self, onesignal_app_id: str, onesignal_api_key: str):
        self.app_id = onesignal_app_id
        self.api_key = onesignal_api_key
        self.base_url = "https://onesignal.com/api/v1"

    async def send_pattern_alert(self, user_id: str, pet_name: str, insight: str):
        """Send pattern detection notification to specific user."""
        await self._send_notification(
            user_id=user_id,
            title=f"Pattern detected for {pet_name}",
            body=insight,
            data={"screen": "InsightDetail", "pet_id": "..."}
        )

    async def send_logging_nudge(self, user_id: str, pet_name: str):
        """Remind user to log after 3+ days of inactivity."""
        await self._send_notification(
            user_id=user_id,
            title="Time for an update!",
            body=f"Keep {pet_name}'s behavior insights accurate with a quick log.",
            data={"screen": "ABCLogging"}
        )

    async def _send_notification(self, user_id, title, body, data=None):
        async with httpx.AsyncClient() as client:
            await client.post(
                f"{self.base_url}/notifications",
                headers={"Authorization": f"Basic {self.api_key}"},
                json={
                    "app_id": self.app_id,
                    "include_external_user_ids": [user_id],
                    "headings": {"en": title},
                    "contents": {"en": body},
                    "data": data or {},
                }
            )
```

## User Preferences
Users can configure in Settings:
- Enable/disable all notifications
- Training reminder time (default: 8pm)
- Pattern alerts on/off (default: on)
- Logging nudges on/off (default: on)
- Milestone celebrations on/off (default: on)

## Notification Frequency Limits
- Maximum 2 push notifications per day per user
- Logging nudges: max 1 per 3 days
- Pattern alerts: max 1 per day
- Never send between 10pm and 8am (respect user timezone)

## Analytics
Track via OneSignal dashboard:
- Delivery rate
- Open rate per notification type
- Conversion rate (notification → action completed)
- Opt-out rate
