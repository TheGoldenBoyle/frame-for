import { View, Text, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native'
import { useState, useEffect } from 'react'

import { StatusBar } from 'expo-status-bar'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useI18n } from '@/lib/i18n/context'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Card } from '@/components/Card'

export default function Index() {
  const { t, locale, setLocale } = useI18n()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleAuth = async () => {
    setError('')
    setIsSubmitting(true)

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) setError(error.message)
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) {
          setError(error.message)
        } else {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          })
          if (signInError) setError(signInError.message)
        }
      }
    } catch (err) {
      setError('Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="items-center justify-center flex-1">
          <Text className="text-text-muted">{t.common.loading}</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (user) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <StatusBar style="dark" />
        <View className="flex-1 p-8">
          <View className="flex-row items-center justify-between mb-8">
            <Text className="text-3xl font-bold text-text">{t.home.title}</Text>
            <View className="flex-row gap-4">
              <TouchableOpacity onPress={() => setLocale(locale === 'en' ? 'de' : 'en')}>
                <Text className="text-sm text-text-muted">{locale === 'en' ? 'DE' : 'EN'}</Text>
              </TouchableOpacity>
              <Button variant="ghost" onPress={handleLogout}>
                {t.auth.logout}
              </Button>
            </View>
          </View>
          <Card>
            <Text className="text-center text-text-muted">{t.auth.welcome}, {user.email}</Text>
            <Text className="mt-4 text-sm text-center text-text-light">
              {t.home.uploadSoon}
            </Text>
          </Card>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-grow"
          keyboardShouldPersistTaps="handled"
        >
          <View className="items-center justify-center flex-1 p-4">
            <View className="w-full max-w-md">
              <Card>
                <View className="flex-row items-center justify-between mb-8">
                  <Text className="text-3xl font-bold text-text">
                    {t.home.title}
                  </Text>
                  <TouchableOpacity onPress={() => setLocale(locale === 'en' ? 'de' : 'en')}>
                    <Text className="text-sm text-text-muted">{locale === 'en' ? 'DE' : 'EN'}</Text>
                  </TouchableOpacity>
                </View>

                <View className="space-y-4">
                  <Input
                    value={email}
                    onChangeText={setEmail}
                    placeholder={t.auth.email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />

                  <Input
                    value={password}
                    onChangeText={setPassword}
                    placeholder={t.auth.password}
                    secureTextEntry
                    autoCapitalize="none"
                    className="mt-4"
                  />

                  {error ? (
                    <Text className="mt-4 text-sm text-center text-red-600">
                      {error}
                    </Text>
                  ) : null}

                  <Button
                    onPress={handleAuth}
                    disabled={isSubmitting}
                    className="w-full mt-4"
                  >
                    {isLogin ? t.auth.login : t.auth.signup}
                  </Button>
                </View>

                <Button
                  variant="ghost"
                  onPress={() => setIsLogin(!isLogin)}
                  className="w-full mt-4"
                >
                  {isLogin ? t.auth.noAccount : t.auth.hasAccount}
                </Button>
              </Card>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}