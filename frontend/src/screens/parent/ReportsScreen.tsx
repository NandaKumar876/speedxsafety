// SpeedxSafety - Weekly Reports Screen
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Rect, Line, Circle as SvgCircle, Polyline } from 'react-native-svg';
import { GlassCard } from '../../components/common';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, getGradeColor } from '../../constants/theme';
import { mockWeeklyReport, mockTeens } from '../../constants/mockData';

const CHART_W = 280, CHART_H = 120;
const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

export const ReportsScreen = () => {
  const r = mockWeeklyReport;
  const gc = getGradeColor(r.safety_grade);
  const maxT = Math.max(...r.daily_trips, 1);
  const bw = (CHART_W/7)*0.6, bg = (CHART_W/7)*0.4;
  const sMin = Math.min(...r.score_trend), sMax = Math.max(...r.score_trend);
  const sR = sMax - sMin || 1;
  const tp = r.score_trend.map((s,i) => 
    `${(i/(r.score_trend.length-1))*CHART_W},${CHART_H-((s-sMin)/sR)*(CHART_H-20)}`
  ).join(' ');

  return (
    <LinearGradient colors={['#0A0E27','#111538','#1A1E3A']} style={{flex:1}}>
      <ScrollView contentContainerStyle={s.sc} showsVerticalScrollIndicator={false}>
        <Text style={s.title}>Weekly Report</Text>
        <Text style={s.date}>{new Date(r.week_start).toLocaleDateString('en-US',{month:'short',day:'numeric'})} — {new Date(r.week_end).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</Text>

        <GlassCard style={[s.gradeCard,{borderColor:gc+'30'}]}>
          <View style={s.gradeRow}>
            <View style={[s.gradeCircle,{borderColor:gc}]}>
              <Text style={[s.gradeText,{color:gc}]}>{r.safety_grade}</Text>
            </View>
            <View style={{flex:1}}>
              <Text style={s.gradeLabel}>Safety Grade</Text>
              <Text style={s.gradeDesc}>
                {r.safety_grade==='A'?'Excellent driving!':r.safety_grade==='B'?'Good. Room for improvement.':'Needs attention.'}
              </Text>
            </View>
          </View>
        </GlassCard>

        <View style={s.statsGrid}>
          {[
            {icon:'car',val:r.total_trips,lbl:'Trips',c:Colors.primary},
            {icon:'map',val:r.total_distance.toFixed(0),lbl:'km',c:Colors.primaryLight},
            {icon:'speedometer',val:r.avg_speed,lbl:'Avg km/h',c:Colors.safe},
            {icon:'warning',val:r.violations,lbl:'Violations',c:r.violations>0?Colors.danger:Colors.safe}
          ].map((st,i) => (
            <GlassCard key={i} style={s.statItem}>
              <Ionicons name={st.icon as any} size={20} color={st.c} />
              <Text style={[s.statVal,{color:st.c}]}>{st.val}</Text>
              <Text style={s.statLbl}>{st.lbl}</Text>
            </GlassCard>
          ))}
        </View>

        <GlassCard style={s.chartCard}>
          <Text style={s.chartTitle}>Daily Trips</Text>
          <Svg width={CHART_W+20} height={CHART_H+10} style={{alignSelf:'center'}}>
            {r.daily_trips.map((t,i) => {
              const x = i*(CHART_W/7)+bg/2+10;
              const h = (t/maxT)*(CHART_H-10);
              return <Rect key={i} x={x} y={CHART_H-h} width={bw} height={h} rx={4} fill={t>0?Colors.primary:'rgba(255,255,255,0.05)'} opacity={t>0?0.8:1}/>;
            })}
          </Svg>
          <View style={s.dayRow}>{days.map(d=><Text key={d} style={s.dayLbl}>{d}</Text>)}</View>
        </GlassCard>

        <GlassCard style={s.chartCard}>
          <View style={s.chartHead}>
            <Text style={s.chartTitle}>Score Trend</Text>
            <View style={s.trendBadge}>
              <Ionicons name="trending-up" size={14} color={Colors.safe}/>
              <Text style={s.trendText}>+{r.score_trend[6]-r.score_trend[0]}</Text>
            </View>
          </View>
          <Svg width={CHART_W+20} height={CHART_H+10} style={{alignSelf:'center'}}>
            <Polyline points={tp} fill="none" stroke={Colors.safe} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round"/>
            {r.score_trend.map((sc,i) => {
              const x=(i/(r.score_trend.length-1))*CHART_W;
              const y=CHART_H-((sc-sMin)/sR)*(CHART_H-20);
              return <SvgCircle key={i} cx={x} cy={y} r={3} fill={Colors.safe}/>;
            })}
          </Svg>
          <View style={s.dayRow}>{days.map(d=><Text key={d} style={s.dayLbl}>{d}</Text>)}</View>
        </GlassCard>

        <GlassCard style={{marginBottom:Spacing.xl}}>
          <View style={{flexDirection:'row',alignItems:'center',gap:Spacing.md}}>
            <View style={[s.noteIcon,{backgroundColor:Colors.danger+'15'}]}>
              <Ionicons name="speedometer" size={20} color={Colors.danger}/>
            </View>
            <View style={{flex:1}}>
              <Text style={s.noteLbl}>Peak Speed This Week</Text>
              <Text style={[s.noteVal,{color:Colors.danger}]}>{r.max_speed} km/h</Text>
              <Text style={s.noteSub}>Limit: {mockTeens[0].speed_limit} km/h</Text>
            </View>
          </View>
        </GlassCard>
      </ScrollView>
    </LinearGradient>
  );
};

const s = StyleSheet.create({
  sc:{paddingHorizontal:Spacing.xl,paddingTop:60,paddingBottom:100},
  title:{fontSize:FontSize.xxl,fontWeight:FontWeight.bold,color:Colors.textPrimary},
  date:{fontSize:FontSize.sm,color:Colors.textTertiary,marginTop:4,marginBottom:Spacing.xxl},
  gradeCard:{marginBottom:Spacing.xl,padding:Spacing.xl},
  gradeRow:{flexDirection:'row',alignItems:'center',gap:Spacing.xl},
  gradeCircle:{width:72,height:72,borderRadius:36,borderWidth:3,justifyContent:'center',alignItems:'center',backgroundColor:'rgba(255,255,255,0.03)'},
  gradeText:{fontSize:FontSize.xxxl,fontWeight:FontWeight.heavy},
  gradeLabel:{fontSize:FontSize.xs,color:Colors.textTertiary,textTransform:'uppercase',letterSpacing:1},
  gradeDesc:{fontSize:FontSize.md,color:Colors.textSecondary,marginTop:4,lineHeight:22},
  statsGrid:{flexDirection:'row',flexWrap:'wrap',gap:Spacing.md,marginBottom:Spacing.xxl},
  statItem:{width:'47%' as any,alignItems:'center',padding:Spacing.lg},
  statVal:{fontSize:FontSize.xxl,fontWeight:FontWeight.heavy,marginTop:Spacing.sm},
  statLbl:{fontSize:FontSize.xs,color:Colors.textTertiary,marginTop:2,textTransform:'uppercase',letterSpacing:0.5},
  chartCard:{marginBottom:Spacing.xl,paddingBottom:Spacing.md},
  chartTitle:{fontSize:FontSize.md,fontWeight:FontWeight.bold,color:Colors.textPrimary,marginBottom:Spacing.lg},
  chartHead:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:Spacing.lg},
  trendBadge:{flexDirection:'row',alignItems:'center',gap:4,backgroundColor:Colors.safe+'15',borderRadius:BorderRadius.round,paddingHorizontal:10,paddingVertical:4},
  trendText:{color:Colors.safe,fontSize:FontSize.sm,fontWeight:FontWeight.bold},
  dayRow:{flexDirection:'row',justifyContent:'space-around',paddingHorizontal:10,marginTop:4},
  dayLbl:{fontSize:10,color:Colors.textTertiary,fontWeight:FontWeight.medium},
  noteIcon:{width:44,height:44,borderRadius:14,justifyContent:'center',alignItems:'center'},
  noteLbl:{fontSize:FontSize.xs,color:Colors.textTertiary,textTransform:'uppercase',letterSpacing:0.5},
  noteVal:{fontSize:FontSize.xxl,fontWeight:FontWeight.heavy,marginVertical:2},
  noteSub:{fontSize:FontSize.sm,color:Colors.textTertiary},
});
