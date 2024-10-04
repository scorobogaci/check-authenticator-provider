import {useEffect, useState} from "react";
import type {Schema} from "../amplify/data/resource";
import {generateClient} from "aws-amplify/data";
import {Authenticator, useAuthenticator} from "@aws-amplify/ui-react";

import {fetchAuthSession, fetchUserAttributes, updateUserAttributes} from "aws-amplify/auth";
import '@aws-amplify/ui-react/styles.css'
import {StorageBrowser} from "@aws-amplify/ui-react-storage";

const client = generateClient<Schema>();

function App() {

    const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);

    useEffect(() => {
        client.models.Todo.observeQuery().subscribe({
            next: (data) => setTodos([...data.items]),
        });
    }, []);

    function createTodo() {
        client.models.Todo.create({content: window.prompt("Todo content")});
    }

    return (
        <Authenticator.Provider>
            <Authenticator>
                <main>
                    <h1>My todos</h1>
                    <button onClick={createTodo}>+ new</button>
                    <ul>
                        {todos.map((todo) => (
                            <li key={todo.id}>{todo.content}</li>
                        ))}
                    </ul>
                    <SampleComponent></SampleComponent>
                    <div>
                        🥳 App successfully hosted. Try creating a new todo.
                        <br/>
                        <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
                            Review next step of this tutorial.
                        </a>
                    </div>
                </main>
            </Authenticator>
        </Authenticator.Provider>
    );
}

const SampleComponent = () => {
    const {user, signOut} = useAuthenticator((context) => [context.user]);

    const defaultPrefixes = [
        'public/',
        (identityId: string) => `protected/${identityId}/`,
        (identityId: string) => `private/${identityId}/`,
    ];

    const logAuthDetails = async ()=>{
        const session = await fetchAuthSession();
        console.log("session : ",session);
        const userAttributes = await fetchUserAttributes();
        console.log('userAttributes : ',userAttributes);
        const isFirstTimeLogin = !userAttributes['custom:identity'] && userAttributes['custom:firstLogin'] === 'true';
        if (isFirstTimeLogin) {
            await updateUserAttributes({
                userAttributes: {
                    'custom:identity': session.identityId,
                    'custom:firstLogin': 'false'
                },
            });
            //client.models.Account.create({identity: session.identityId!, email: userAttributes.email});
        } else {
            //const {data} = await client.models.Account.get({identity: session.identityId!});
            //console.log("Account details loaded : ", data);
        }
    }

    const logoutUser = async () => {
        await signOut();
    }
    return (
        <>
            <div>Hello {user?.signInDetails?.loginId}</div>
            <button onClick={logoutUser}></button>
            <div onClick={logAuthDetails}>log auth details</div>
            <StorageBrowser defaultPrefixes={defaultPrefixes} />
        </>
    )
}

export default App;
