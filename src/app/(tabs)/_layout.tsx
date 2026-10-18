import { Tabs } from "expo-router";
import { Icon, type IconName } from "../../components/ui";
import { useTheme } from "../../components/theme";
export default function TabLayout() {
  const t = useTheme();
  const tabs: { name: string; title: string; icon: IconName }[] = [
    { name: "index", title: "Today", icon: "sun" },
    { name: "library", title: "Library", icon: "library" },
    { name: "upload", title: "Add video", icon: "plus" },
    { name: "practice", title: "Practice", icon: "practice" },
    { name: "settings", title: "Settings", icon: "settings" },
  ];
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: t.primary,
        tabBarInactiveTintColor: t.muted,
        tabBarStyle: {
          backgroundColor: t.surface,
          borderTopColor: t.border,
          height: 84,
          paddingTop: 9,
          paddingBottom: 20,
        },
        tabBarLabelStyle: { fontFamily: "DMSans_500Medium", fontSize: 11 },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color }) => (
              <Icon
                name={tab.icon}
                color={typeof color === "string" ? color : undefined}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
