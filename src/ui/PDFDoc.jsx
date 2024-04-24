import { Document, Page, StyleSheet, Text } from "@react-pdf/renderer";
import React from "react";

export const PDFDoc = (content ) => {
  const styles = StyleSheet.create({
    page: { backgroundColor: 'white', padding: '30px' },
    content: {fontSize: '12px', textAlign:'justify', fontWeight:'normal' },
    title: { color: 'black', textAlign: 'center', marginBottom: '20px', fontSize:'16px' }
  });
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Transcripción</Text>
        <Text style={styles.content}>{content}</Text>
      </Page>
    </Document>
  );
};
