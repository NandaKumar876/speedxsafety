// SpeedxSafety - Settings Screen (shared)
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard, GradientButton } from '../../components/common';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/theme';
import { mockTeens } from '../../constants/mockData';
import { scaleWidth, scaleHeight, scaleFont } from '../../utils/responsive';

export const SettingsScreen = ({ navigation }: any) => {
  const [speedLimit, setSpeedLimit] = useState(80);
  const [curfew, setCurfew] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [crashDetect, setCrashDetect] = useState(true);
  const [phoneDetect, setPhoneDetect] = useState(true);

  const SettingRow = ({ icon, iconColor, title, subtitle, right }: any) => (
    <View style={s.settingRow}>
      <View style={[s.settingIcon, { backgroundColor: iconColor + '1A' }]}>
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
    <LinearGradient colors={Colors.gradientBg as any} style={{flex:1}}>
      <ScrollView contentContainerStyle={s.sc} showsVerticalScrollIndicator={false}>
        <Text style={s.title}>Settings</Text>

        {/* Profile */}
        <GlassCard style={s.profileCard}>
          <LinearGradient colors={Colors.gradientPrimary as any} style={s.avatar}>
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
            icon="speedometer" iconColor={Colors.primaryLight}
            title="Default Speed Limit"
            subtitle={`${speedLimit} km/h`}
            right={
              <View style={s.stepper}>
                <TouchableOpacity style={s.stepBtn} onPress={() => setSpeedLimit(Math.max(30, speedLimit - 5))} activeOpacity={0.7}>
                  <Ionicons name="remove" size={18} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={s.stepValue}>{speedLimit}</Text>
                <TouchableOpacity style={s.stepBtn} onPress={() => setSpeedLimit(Math.min(130, speedLimit + 5))} activeOpacity={0.7}>
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
            right={<Switch value={curfew} onValueChange={setCurfew} trackColor={{false:'#20264E',true:Colors.primaryLight+'50'}} thumbColor={curfew?Colors.primaryLight:'#606A93'}/>}
          />
          <View style={s.divider}/>
          <SettingRow icon="alert-circle" iconColor={Colors.danger} title="Crash Detection" subtitle="Auto-alert on sudden deceleration"
            right={<Switch value={crashDetect} onValueChange={setCrashDetect} trackColor={{false:'#20264E',true:Colors.danger+'50'}} thumbColor={crashDetect?Colors.danger:'#606A93'}/>}
          />
          <View style={s.divider}/>
          <SettingRow icon="phone-portrait" iconColor={Colors.warning} title="Phone Usage Detection" subtitle="Detect phone use while driving"
            right={<Switch value={phoneDetect} onValueChange={setPhoneDetect} trackColor={{false:'#20264E',true:Colors.warning+'50'}} thumbColor={phoneDetect?Colors.warning:'#606A93'}/>}
          />
        </GlassCard>

        {/* Notifications */}
        <Text style={s.sectionTitle}>Notifications</Text>
        <GlassCard>
          <SettingRow icon="notifications" iconColor={Colors.safe} title="Push Notifications" subtitle="Speed & geofence alerts"
            right={<Switch value={notifications} onValueChange={setNotifications} trackColor={{false:'#20264E',true:Colors.safe+'50'}} thumbColor={notifications?Colors.safe:'#606A93'}/>}
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
        <TouchableOpacity style={s.signOut} onPress={() => navigation.replace('Login')} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
          <Text style={s.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={s.version}>SpeedxSafety v1.0.0</Text>
      </ScrollView>
    </LinearGradient>
  );
};

const s = StyleSheet.create({
  sc:{paddingHorizontal:Spacing.xl,paddingTop:scaleHeight(60),paddingBottom:scaleHeight(100)},
  title:{fontSize:FontSize.xxl,fontWeight:FontWeight.bold,color:Colors.textPrimary,marginBottom:Spacing.xxl},
  sectionTitle:{fontSize:FontSize.md,fontWeight:FontWeight.semibold,color:Colors.textSecondary,marginTop:Spacing.xxl,marginBottom:Spacing.md},
  profileCard:{flexDirection:'row',alignItems:'center',gap:Spacing.lg,marginBottom:Spacing.md},
  avatar:{width:scaleWidth(52),height:scaleWidth(52),borderRadius:scaleWidth(16),justifyContent:'center',alignItems:'center'},
  avatarText:{color:'#fff',fontSize:FontSize.lg,fontWeight:FontWeight.bold},
  profileName:{fontSize:FontSize.lg,fontWeight:FontWeight.bold,color:Colors.textPrimary},
  profileRole:{fontSize:FontSize.sm,color:Colors.textTertiary,marginTop:1},
  settingRow:{flexDirection:'row',alignItems:'center',gap:Spacing.md,paddingVertical:Spacing.sm},
  settingIcon:{width:scaleWidth(36),height:scaleWidth(36),borderRadius:scaleWidth(10),justifyContent:'center',alignItems:'center'},
  settingInfo:{flex:1},
  settingTitle:{fontSize:FontSize.md,fontWeight:FontWeight.medium,color:Colors.textPrimary},
  settingSub:{fontSize:FontSize.xs,color:Colors.textTertiary,marginTop:1},
  divider:{height:1,backgroundColor:Colors.border,marginVertical:Spacing.sm},
  stepper:{flexDirection:'row',alignItems:'center',gap:Spacing.md,backgroundColor:Colors.bgCard,borderRadius:BorderRadius.md,paddingHorizontal:scaleWidth(6),paddingVertical:scaleHeight(4)},
  stepBtn:{width:scaleWidth(28),height:scaleWidth(28),borderRadius:scaleWidth(8),backgroundColor:'rgba(255,255,255,0.06)',justifyContent:'center',alignItems:'center'},
  stepValue:{fontSize:FontSize.md,fontWeight:FontWeight.bold,color:Colors.primaryLight,minWidth:scaleWidth(30),textAlign:'center'},
  teenRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:Spacing.sm},
  teenInfo:{flexDirection:'row',alignItems:'center',gap:Spacing.md},
  teenAvatar:{width:scaleWidth(36),height:scaleWidth(36),borderRadius:scaleWidth(10),justifyContent:'center',alignItems:'center'},
  teenInit:{color:'#fff',fontSize:FontSize.md,fontWeight:FontWeight.bold},
  teenName:{fontSize:FontSize.md,fontWeight:FontWeight.semibold,color:Colors.textPrimary},
  teenLimit:{fontSize:FontSize.xs,color:Colors.textTertiary},
  signOut:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:Spacing.sm,marginTop:Spacing.xxxl,paddingVertical:scaleHeight(14),borderWidth:1.2,borderColor:Colors.danger+'30',borderRadius:BorderRadius.lg},
  signOutText:{color:Colors.danger,fontSize:FontSize.md,fontWeight:FontWeight.semibold},
  version:{textAlign:'center',fontSize:FontSize.xs,color:Colors.textTertiary,marginTop:Spacing.xl},
});
