import streamlit as st
import plotly.express as px
import pandas as pd
from database import get_db_connection

# 🌀 Force the dashboard page to automatically pull fresh database state every 3 seconds
st.logo("https://img.icons8.com/fluency/48/shield.png")
st.set_page_config(page_title="Enterprise Fraud Radar", layout="wide")

# Autorefresh mechanism built natively into modern Streamlit layout containers
if "run_count" not in st.session_state:
    st.session_state.run_count = 0
st.session_state.run_count += 1

# Top Bar Grid Headers
st.title("🛡️ Enterprise Fraud Radar & Risk Mitigation Workspace")
st.markdown("Streaming live transactional audit records continuously from local data clusters.")

# Pipeline ingestion layer
try:
    conn = get_db_connection()
    df = pd.read_sql("SELECT * FROM transactions ORDER BY timestamp DESC;", conn)
    conn.close()
except Exception as e:
    st.error(f"Database core extraction failure: {e}")
    df = pd.DataFrame()

if not df.empty:
    # Ensure correct data types for processing
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df['amount'] = df['amount'].astype(float)
    df['risk_score'] = df['risk_score'].astype(float)
    df['is_anomaly'] = df['is_anomaly'].astype(int)

    # 📊 SECTION 1: THE MULTI-METRIC PERFORMANCE GRID
    total_tx = len(df)
    fraud_tx = df['is_anomaly'].sum()
    fraud_rate = (fraud_tx / total_tx) * 100 if total_tx > 0 else 0
    total_capital = df['amount'].sum()
    avg_risk = df['risk_score'].mean() * 100

    # Render a 5-column executive metric bar
   # Render a 5-column executive metric bar
    m1, m2, m3, m4, m5 = st.columns(5)
    m1.metric("Total Logs Audited", f"{total_tx:,}")
    m2.metric("Intercepted Threats", f"{int(fraud_tx)} cases", delta="Active Monitoring", delta_color="inverse")
    m3.metric("Fraud Velocity Rate", f"{fraud_rate:.1f}%")
    m4.metric("Total Volume Capital Flow", f"${total_capital:,.2f}")
    m5.metric("System Mean Risk Index", f"{avg_risk:.1f}%")

    st.markdown("---")

    # 🚨 AUTOMATED THREAT GATEWAY OVERRIDE SYSTEM
    # Dynamic component that shifts states based on incoming live data variables
    if fraud_rate > 15.0:
        st.error(f"🔴 CRITICAL ALERT: System Fraud Velocity ({fraud_rate:.1f}%) exceeds secure network thresholds! Automated Gateway Isolation Protocol: **ARMED**")
    else:
        st.success("🟢 GATEWAY STATUS: Nominal. Network operation parameters are performing within safe enterprise baseline margins.")

    st.markdown("---")

    # SECTION 2: LIVE ADVANCED CHARTING LAYOUT
    c1, c2, c3 = st.columns([2, 1, 1])

    with c1:
        st.subheader("📈 Rolling Capital Velocity Load")
        # Time-series line chart mapping transaction spikes chronologically
        df_sorted = df.sort_values('timestamp')
        fig_line = px.line(df_sorted, x='timestamp', y='amount', color='is_anomaly',
                           title="Transaction Capital Spikes Chronologically",
                           color_discrete_map={1: "#EF553B", 0: "#00CC96"},
                           labels={"amount": "Transaction Value ($)", "timestamp": "System Clock Timestamp"})
        st.plotly_chart(fig_line, use_container_width=True)

    with c2:
        st.subheader("🍩 Threat Distribution by Merchant")
        # Donut summary analyzing exposure limits across industries
        fig_pie = px.pie(df, names='merchant_category', values='amount', hole=0.4,
                         title="Capital Densities by Segment Node",
                         color_discrete_sequence=px.colors.qualitative.Pastel)
        st.plotly_chart(fig_pie, use_container_width=True)

    with c3:
        st.subheader("📱 Device Vector Breakdown")
        # Bar chart tracking which interface vectors fraudsters are utilizing
        fig_device = px.bar(df, x='device_type', y='amount', color='is_anomaly',
                            title="Payload Value via Device Node",
                            color_discrete_map={1: "#EF553B", 0: "#636EFA"})
        st.plotly_chart(fig_device, use_container_width=True)

    st.markdown("---")

    # SECTION 3: SEARCH INTERCEPT & LOG INVESTIGATION
    st.subheader("🔍 Advanced Threat Search & Investigation Log")
    
    # Live UI filtering system
    search_col1, search_col2 = st.columns(2)
    with search_col1:
        location_filter = st.selectbox("Filter Logs by Regional Node:", ["ALL"] + list(df['location'].unique()))
    with search_col2:
        anomaly_filter = st.selectbox("Filter Logs by Risk Condition:", ["ALL", "Flagged Anomalies Only", "Approved Transactions Only"])

    filtered_df = df.copy()
    if location_filter != "ALL":
        filtered_df = filtered_df[filtered_df['location'] == location_filter]
    if anomaly_filter == "Flagged Anomalies Only":
        filtered_df = filtered_df[filtered_df['is_anomaly'] == 1]
    elif anomaly_filter == "Approved Transactions Only":
        filtered_df = filtered_df[filtered_df['is_anomaly'] == 0]

    st.dataframe(filtered_df, use_container_width=True)

else:
    st.info("The dashboard is synchronized cleanly. Start simulator.py to see real-time capital streaming analytics pipelines update automatically.")

# Simple JavaScript hack to force Streamlit frontend to cycle run state every 3 seconds without freezing inputs
st.components.v1.html(
    """
    <script>
        window.parent.document.querySelector('section.main').scrollTo(0,0);
        setTimeout(function(){ window.location.reload(); }, 3000);
    </script>
    """, height=0
)