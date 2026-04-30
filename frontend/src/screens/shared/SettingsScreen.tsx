// SpeedxSafety - Settings Screen (shared)
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard, GradientButton } from '../../components/common';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/theme';
import { mockTeens } from '../../constants/mockData';

export const SettingsScreen = ({ navigation }: any) => {
  const [speedLimit, setSpeedLimit] = useState(80);
  const [curfew, setCurfew] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [crashDetect, setCrashDetect] = useState(true);
  const [phoneDetect, setPhoneDetect] = useState(true);

  const SettingRow = ({ icon, iconColor, title, subtitle, right }: any) => (
    <View style={s.settingRow}>
      <View style={[s.settingIcon, { backgroundColor: iconColor + '15' }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View style={s.settingInfo}>
        <Text style={s.settingTitle}>{title}</Text>
        {subtitle && <Text style={s.settingSub}>{subtitle}</Text>}
      </View>
      {right}
    </View>
  );

  return (
    <LinearGradient colors={['#0A0E27','#111538','#1A1E3A']} style={{flex:1}}>
      <ScrollView contentContainerStyle={s.sc} showsVerticalScrollIndicator={false}>
        <Text style={s.title}>Settings</Text>

        {/* Profile */}
        <GlassCard style={s.profileCard}>
          <LinearGradient colors={['#007AFF','#00C6FF']} style={s.avatar}>
            <Text style={s.avatarText}>SJ</Text>
          </LinearGradient>
          <View>
            <Text style={s.profileName}>Sarah Johnson</Text>
            <Text style={s.profileRole}>Parent Account</Text>
          </View>
        </GlassCard>

        {/* Speed Limits */}
        <Text style={s.sectionTitle}>Speed Settings</Text>
        <GlassCard>
          <SettingRow
            icon="speedometer" iconColor={Colors.primary}
            title="Default Speed Limit"
            subtitle={`${speedLimit} km/h`}
            right={
              <View style={s.stepper}>
                <TouchableOpacity style={s.stepBtn} onPress={() => setSpeedLimit(Math.max(30, speedLimit - 5))}>
                  <Ionicons name="remove" size={18} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={s.stepValue}>{speedLimit}</Text>
                <TouchableOpacity style={s.stepBtn} onPress={() => setSpeedLimit(Math.min(130, speedLimit + 5))}>
                  <Ionicons name="add" size={18} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>
            }
          />
        </GlassCard>

        {/* Safety Features */}
        <Text style={s.sectionTitle}>Safety Features</Text>
        <GlassCard>
          <SettingRow icon="moon" iconColor={Colors.primaryLight} title="Night Curfew" subtitle="Stricter limits 10PM–6AM"
            right={<Switch value={curfew} onValueChange={setCurfew} trackColor={{false:'#3A3A4A',true:Colors.primary+'50'}} thumbColor={curfew?Colors.primary:'#8E8E93'}/>}
          />
          <View style={s.divider}/>
          <SettingRow icon="alert-circle" iconColor={Colors.danger} title="Crash Detection" subtitle="Auto-alert on sudden deceleration"
            right={<Switch value={crashDetect} onValueChange={setCrashDetect} trackColor={{false:'#3A3A4A',true:Colors.danger+'50'}} thumbColor={crashDetect?Colors.danger:'#8E8E93'}/>}
          />
          <View style={s.divider}/>
          <SettingRow icon="phone-portrait" iconColor={Colors.warning} title="Phone Usage Detection" subtitle="Detect phone use while driving"
            right={<Switch value={phoneDetect} onValueChange={setPhoneDetect} trackColor={{false:'#3A3A4A',true:Colors.warning+'50'}} thumbColor={phoneDetect?Colors.warning:'#8E8E93'}/>}
          />
        </GlassCard>

        {/* Notifications */}
        <Text style={s.sectionTitle}>Notifications</Text>
        <GlassCard>
          <SettingRow icon="notifications" iconColor={Colors.safe} title="Push Notifications" subtitle="Speed & geofence alerts"
            right={<Switch value={notifications} onValueChange={setNotifications} trackColor={{false:'#3A3A4A',true:Colors.safe+'50'}} thumbColor={notifications?Colors.safe:'#8E8E93'}/>}
          />
        </GlassCard>

        {/* Teens Management */}
        <Text style={s.sectionTitle}>Linked Teens</Text>
        {mockTeens.map(teen => (
          <GlassCard key={teen.teen_id} style={s.teenRow}>
            <View style={s.teenInfo}>
              <LinearGradient colors={['#34C759','#30D158']} style={s.teenAvatar}>
                <Text style={s.teenInit}>{teen.name[0]}</Text>
              </LinearGradient>
              <View>
                <Text style={s.teenName}>{teen.name}</Text>
                <Text style={s.teenLimit}>Limit: {teen.speed_limit} km/h</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
          </GlassCard>
        ))}

        {/* Sign Out */}
        <TouchableOpacity style={s.signOut} onPress={() => navigation.replace('Login')}>
          <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
          <Text style={s.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={s.version}>SpeedxSafety v1.0.0</Text>
      </ScrollView>
    </LinearGradient>
  );
};

const s = StyleSheet.create({
  sc:{paddingHorizontal:Spacing.xl,paddingTop:60,paddingBottom:100},
  title:{fontSize:FontSize.xxl,fontWeight:FontWeight.bold,color:Colors.textPrimary,marginBottom:Spacing.xxl},
  sectionTitle:{fontSize:FontSize.md,fontWeight:FontWeight.semibold,color:Colors.textSecondary,marginTop:Spacing.xxl,marginBottom:Spacing.md},
  profileCard:{flexDirection:'row',alignItems:'center',gap:Spacing.lg,marginBottom:Spacing.md},
  avatar:{width:52,height:52,borderRadius:16,justifyContent:'center',alignItems:'center'},
  avatarText:{color:'#fff',fontSize:FontSize.lg,fontWeight:FontWeight.bold},
  profileName:{fontSize:FontSize.lg,fontWeight:FontWeight.bold,color:Colors.textPrimary},
  profileRole:{fontSize:FontSize.sm,color:Colors.textTertiary,marginTop:1},
  settingRow:{flexDirection:'row',alignItems:'center',gap:Spacing.md,paddingVertical:Spacing.sm},
  settingIcon:{width:36,height:36,borderRadius:10,justifyContent:'center',alignItems:'center'},
  settingInfo:{flex:1},
  settingTitle:{fontSize:FontSize.md,fontWeight:FontWeight.medium,color:Colors.textPrimary},
  settingSub:{fontSize:FontSize.xs,color:Colors.textTertiary,marginTop:1},
  divider:{height:1,backgroundColor:Colors.border,marginVertical:Spacing.sm},
  stepper:{flexDirection:'row',alignItems:'center',gap:Spacing.md,backgroundColor:Colors.bgCard,borderRadius:BorderRadius.md,paddingHorizontal:4,paddingVertical:2},
  stepBtn:{width:28,height:28,borderRadius:8,backgroundColor:'rgba(255,255,255,0.1)',justifyContent:'center',alignItems:'center'},
  stepValue:{fontSize:FontSize.md,fontWeight:FontWeight.bold,color:Colors.primary,minWidth:30,textAlign:'center'},
  teenRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:Spacing.sm},
  teenInfo:{flexDirection:'row',alignItems:'center',gap:Spacing.md},
  teenAvatar:{width:36,height:36,borderRadius:10,justifyContent:'center',alignItems:'center'},
  teenInit:{color:'#fff',fontSize:FontSize.md,fontWeight:FontWeight.bold},
  teenName:{fontSize:FontSize.md,fontWeight:FontWeight.semibold,color:Colors.textPrimary},
  teenLimit:{fontSize:FontSize.xs,color:Colors.textTertiary},
  signOut:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:Spacing.sm,marginTop:Spacing.xxxl,paddingVertical:Spacing.lg,borderWidth:1,borderColor:Colors.danger+'30',borderRadius:BorderRadius.lg},
  signOutText:{color:Colors.danger,fontSize:FontSize.md,fontWeight:FontWeight.semibold},
  version:{textAlign:'center',fontSize:FontSize.xs,color:Colors.textTertiary,marginTop:Spacing.xl},
});
