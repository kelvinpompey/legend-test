import { Stack } from 'expo-router';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { linked, observable, observe } from '@legendapp/state';
import { syncedCrud } from '@legendapp/state/sync-plugins/crud';

import { Memo, observer, Reactive, useObservable } from '@legendapp/state/react';

import { Button } from '~/components/Button';
import { useRef } from 'react';
import { generateRandomString } from '~/lib/random';

let BASE_URL = 'https://jsonplaceholder.typicode.com/';

type Todo = {
  completed: boolean;
  id: string;
  title: string;
  userId: string;
};

const crudStore$ = observable(
  syncedCrud({
    list: () => fetch(`${BASE_URL}/todos?_limit=10`).then((res) => res.json()),
    create: (value, params) => {
      console.log('create value ', value, params);

      fetch(`${BASE_URL}/todos?_limit=10`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(value),
      }).then((res) => res.json());
    },
    update(input, params) {
      console.log('update ', input, params);
      fetch(`${BASE_URL}/todos/${input.id}?_limit=10`, {
        method: 'put',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      }).then((res) => res.json());
    },
  })
);

let todos$ = observable(() => {
  let data = crudStore$.get() as Record<string, Todo>;
  return data ? Object.values(data) : [];
});

function Home() {
  const renderCount = useRef(1).current++;

  const todos = todos$.get();

  let input$ = useObservable({
    todo: '',
  });

  return (
    <>
      <Stack.Screen options={{ title: 'Tab One' }} />
      <View style={styles.container}>
        <Text>Renders: {renderCount}</Text>

        <FlatList
          data={todos} // Use the array from the observable store
          keyExtractor={(item, index) => index.toString()} // Ensure each item has a unique key
          renderItem={({ item }) => (
            <View className="flex-1 flex-row justify-between">
              <Text className="max-w-[250px] text-2xl">
                {item.title} {item.completed ? '*' : ''}
              </Text>
              <View>
                <Button
                  title="Complete"
                  onPress={() => {
                    crudStore$[item.id].completed.set(true);
                  }}></Button>
              </View>
            </View>
          )}
          contentContainerStyle={{ padding: 16 }}
        />

        <Reactive.TextInput placeholder="Item" $value={input$.todo} style={{ padding: 16 }} />
        <Button
          onPress={() => {
            let id = generateRandomString();

            console.log('id ', id);

            crudStore$[id].set({
              id,
              title: input$.get().todo,
              completed: false,
            });
          }}
          title="Add Item"></Button>
      </View>
    </>
  );
}

export default observer(Home);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
});
