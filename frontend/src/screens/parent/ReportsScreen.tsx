// ============================================
// SpeedxSafety - Weekly Reports (Spatial Edition)
// ============================================
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Rect, Circle as SvgCircle, Polyline } from 'react-native-svg';
import { GlassCard } from '../../components/common';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow, getGradeColor } from '../../constants/theme';
import { scaleWidth, scaleHeight, scaleFont, getSafeAreaTop } from '../../utils/responsive';
import { getCurrentUser } from '../../services/authService';
import { getWeeklyReport, getTeens } from '../../services/dataService';
import { ActivityIndicator } from 'react-native';

const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

export const ReportsScreen = () => {
  const [report, setReport] = useState<any>(null);
  const [teen, setTeen] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { width } = useWindowDimensions();

  useEffect(() => {
    const loadReportData = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          const riders = await getTeens(user.id);
          if (riders && riders.length > 0) {
            const firstTeen = riders[0];
            setTeen(firstTeen);
            const weeklyRep = await getWeeklyReport(firstTeen.teen_id);
            setReport(weeklyRep || {
              teen_id: firstTeen.teen_id,
              week_start: Date.now() - 7 * 24 * 60 * 60 * 1000,
              week_end: Date.now(),
              total_trips: 0,
              total_distance: 0,
              avg_speed: 0,
              violations: 0,
              max_speed: 0,
              safety_grade: 'A',
              daily_trips: [0, 0, 0, 0, 0, 0, 0],
              score_trend: [100, 100, 100, 100, 100, 100, 100]
            });
          }
        }
      } catch (err) {
        console.warn('Failed to load report data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadReportData();
  }, []);

  if (loading || !report || !teen) {
    return (
      <LinearGradient colors={Colors.gradientBg as any} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </LinearGradient>
    );
  }

  const r = report;
  const gc = getGradeColor(r.safety_grade);
  const maxW = 800; // Limit web chart size
  const actualWidth = Math.min(width, maxW);
  const chartWidth = Math.max(260, actualWidth - Spacing.xl * 2 - Spacing.lg * 2 - 10);
  const chartHeight = scaleHeight(120);
  const dailyTrips = r.daily_trips || [0, 0, 0, 0, 0, 0, 0];
  const scoreTrend = r.score_trend || [100, 100, 100, 100, 100, 100, 100];
  const maxT = Math.max(...dailyTrips, 1);
  const bw = (chartWidth / 7) * 0.6, bg = (chartWidth / 7) * 0.4;
  const sMin = Math.min(...scoreTrend), sMax = Math.max(...scoreTrend);
  const sR = sMax - sMin || 1;
  const tp = scoreTrend.map((s: number, i: number) =>
    `${(i / (scoreTrend.length - 1)) * chartWidth},${chartHeight - ((s - sMin) / sR) * (chartHeight - 20)}`
  ).join(' ');
  const trendDiff = (scoreTrend[scoreTrend.length - 1] || 0) - (scoreTrend[0] || 0);

  return (
    <LinearGradient colors={Colors.gradientBg as any} style={{flex:1}}>
      <ScrollView contentContainerStyle={styles.sc} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Weekly Report</Text>
        <Text style={styles.date}>
          {new Date(r.week_start).toLocaleDateString('en-US',{month:'short',day:'numeric'})} — {new Date(r.week_end).toLocaleDateString('en-US',{month:'short',day:'numeric'})}
        </Text>

        {/* Grade hero */}
        <GlassCard style={[styles.gradeCard,{borderColor:gc+'25'}]} elevation="floating" glowColor={gc}>
          <View style={styles.gradeRow}>
            <View style={[styles.gradeCircle,{borderColor:gc, ...Shadow.glow(gc)}]}>
              <Text style={[styles.gradeText,{color:gc}]}>{r.safety_grade}</Text>
            </View>
            <View style={{flex:1}}>
              <Text style={styles.gradeLabel}>Safety Grade</Text>
              <Text style={styles.gradeDesc}>
                {r.safety_grade==='A'?'Excellent driving this week!':r.safety_grade==='B'?'Good. Room for improvement.':'Needs attention.'}
              </Text>
            </View>
          </View>
        </GlassCard>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          {[
            {icon:'car',val:r.total_trips,lbl:'Trips',c:Colors.primaryLight},
            {icon:'map',val:r.total_distance.toFixed(0),lbl:'km',c:Colors.primaryLight},
            {icon:'speedometer',val:r.avg_speed,lbl:'Avg km/h',c:Colors.safe},
            {icon:'warning',val:r.violations,lbl:'Violations',c:r.violations>0?Colors.danger:Colors.safe}
          ].map((st,i) => (
            <GlassCard key={i} style={styles.statItem} animated delay={i * 80} elevation="raised">
              <View style={[styles.statIconBg, { backgroundColor: st.c + '12' }]}>
                <Ionicons name={st.icon as any} size={18} color={st.c} />
              </View>
              <Text style={[styles.statVal,{color:st.c}]}>{st.val}</Text>
              <Text style={styles.statLbl}>{st.lbl}</Text>
            </GlassCard>
          ))}
        </View>

        {/* Daily trips chart */}
        <GlassCard style={styles.chartCard} elevation="raised" animated delay={300}>
          <Text style={styles.chartTitle}>Daily Trips</Text>
          <Svg width={chartWidth+10} height={chartHeight+10} style={{alignSelf:'center'}}>
            {dailyTrips.map((t: number, i: number) => {
              const x = i*(chartWidth/7)+bg/2+5;
              const h = (t/maxT)*(chartHeight-10);
              return <Rect key={i} x={x} y={chartHeight-h} width={bw} height={h} rx={6} fill={t>0?Colors.primaryLight:'rgba(255,255,255,0.05)'} opacity={t>0?0.8:1}/>;
            })}
          </Svg>
          <View style={styles.dayRow}>{days.map(d=><Text key={d} style={styles.dayLbl}>{d}</Text>)}</View>
        </GlassCard>

        {/* Score trend chart */}
        <GlassCard style={styles.chartCard} elevation="raised" animated delay={400}>
          <View style={styles.chartHead}>
            <Text style={styles.chartTitle}>Score Trend</Text>
            <View style={styles.trendBadge}>
              <Ionicons name="trending-up" size={14} color={Colors.safe}/>
              <Text style={styles.trendText}>{trendDiff >= 0 ? `+${trendDiff}` : trendDiff}</Text>
            </View>
          </View>
          <Svg width={chartWidth+10} height={chartHeight+10} style={{alignSelf:'center'}}>
            <Polyline points={tp} fill="none" stroke={Colors.safe} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round"/>
            {scoreTrend.map((sc: number, i: number) => {
              const x=(i/(scoreTrend.length-1))*chartWidth;
              const y=chartHeight-((sc-sMin)/sR)*(chartHeight-20);
              return <SvgCircle key={i} cx={x} cy={y} r={3.5} fill={Colors.safe}/>;
            })}
          </Svg>
          <View style={styles.dayRow}>{days.map(d=><Text key={d} style={styles.dayLbl}>{d}</Text>)}</View>
        </GlassCard>

        {/* Peak speed */}
        <GlassCard style={{marginBottom:Spacing.xl}} elevation="raised" glowColor={Colors.danger} animated delay={500}>
          <View style={{flexDirection:'row',alignItems:'center',gap:Spacing.md}}>
            <View style={[styles.noteIcon,{backgroundColor:Colors.dangerMuted}]}>
              <Ionicons name="speedometer" size={20} color={Colors.danger}/>
            </View>
            <View style={{flex:1}}>
              <Text style={styles.noteLbl}>Peak Speed This Week</Text>
              <Text style={[styles.noteVal,{color:Colors.danger}]}>{r.max_speed} km/h</Text>
              <Text style={styles.noteSub}>Limit: {teen.speed_limit} km/h</Text>
            </View>
          </View>
        </GlassCard>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  sc: { paddingHorizontal: Spacing.xl, paddingTop: getSafeAreaTop() + 12, paddingBottom: scaleHeight(120), alignSelf: 'center', width: '100%', maxWidth: 800 },
  title:{fontSize:FontSize.xxl,fontWeight:FontWeight.bold,color:Colors.textPrimary, letterSpacing: -0.5},
  date:{fontSize:FontSize.sm,color:Colors.textTertiary,marginTop:4,marginBottom:Spacing.xxl},
  gradeCard:{marginBottom:Spacing.xxl,padding:Spacing.xl},
  gradeRow:{flexDirection:'row',alignItems:'center',gap:Spacing.xl},
  gradeCircle:{width:scaleWidth(72),height:scaleWidth(72),borderRadius:scaleWidth(36),borderWidth:3,justifyContent:'center',alignItems:'center',backgroundColor:'rgba(255,255,255,0.03)'},
  gradeText:{fontSize:FontSize.xxxl,fontWeight:FontWeight.heavy},
  gradeLabel:{fontSize:FontSize.xs,color:Colors.textTertiary,textTransform:'uppercase',letterSpacing:1},
  gradeDesc:{fontSize:FontSize.md,color:Colors.textSecondary,marginTop:4,lineHeight:22},
  statsGrid:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between',rowGap:Spacing.md,marginBottom:Spacing.xxl},
  statItem:{width:'48%',alignItems:'center',padding:Spacing.lg},
  statIconBg:{width:scaleWidth(34),height:scaleWidth(34),borderRadius:scaleWidth(10),justifyContent:'center',alignItems:'center',marginBottom:Spacing.xs},
  statVal:{fontSize:FontSize.xxl,fontWeight:FontWeight.heavy},
  statLbl:{fontSize:FontSize.xs,color:Colors.textTertiary,marginTop:2,textTransform:'uppercase',letterSpacing:0.5},
  chartCard:{marginBottom:Spacing.xl,paddingBottom:Spacing.md},
  chartTitle:{fontSize:FontSize.md,fontWeight:FontWeight.bold,color:Colors.textPrimary,marginBottom:Spacing.lg},
  chartHead:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:Spacing.lg},
  trendBadge:{flexDirection:'row',alignItems:'center',gap:4,backgroundColor:Colors.safeMuted,borderRadius:BorderRadius.round,paddingHorizontal:10,paddingVertical:4},
  trendText:{color:Colors.safe,fontSize:FontSize.sm,fontWeight:FontWeight.bold},
  dayRow:{flexDirection:'row',justifyContent:'space-around',paddingHorizontal:10,marginTop:4},
  dayLbl:{fontSize:10,color:Colors.textTertiary,fontWeight:FontWeight.medium},
  noteIcon:{width:scaleWidth(44),height:scaleWidth(44),borderRadius:scaleWidth(14),justifyContent:'center',alignItems:'center'},
  noteLbl:{fontSize:FontSize.xs,color:Colors.textTertiary,textTransform:'uppercase',letterSpacing:0.5},
  noteVal:{fontSize:FontSize.xxl,fontWeight:FontWeight.heavy,marginVertical:2},
  noteSub:{fontSize:FontSize.sm,color:Colors.textTertiary},
});
