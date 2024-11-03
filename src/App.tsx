import "./App.css";
import { createResource, createSignal, onMount } from "solid-js";
import { Ausstattung, getAvatar } from "./api";
import { Input, Button, InventoryGrid, AvatarView, ItemsView } from "./components";
import { Refresh } from "./components/Icons";
import { connect } from "./tauri";


function App() {
  const [id, setId] = createSignal<string | undefined>(undefined);
  const [avatar, { refetch, mutate }] = createResource(id, async id => await getAvatar(id));

  let tempId: string | undefined;

  onMount(() => { 
    connect("facebamm_1");
  });

  const onIdChanged = (e: Event) => {
    tempId = (e.target as HTMLInputElement).value;
  }

  const onSearchClick = (e: Event) => { 
    mutate(undefined); setId(tempId); 
  }

  return (
    <main class="absolute w-screen h-screen">
      <div class="bg-[#025E9C] p-8 min-w-[50%]">
        <div class="flex flex-row items-center justify-center mb-4">
          <Input type="text" onchange={onIdChanged} />
          {avatar() &&  <div class="bg-yellow-600 hover:bg-yellow-700 fill-white rounded p-4 mr-2" onclick={onSearchClick}><Refresh /></div>}
          <Button onclick={onSearchClick}>Suchen</Button>
        </div>
        <div class="flex flex-row gap-x-20 md:flex-wrap-reverse">
          {avatar() && <>
            <InventoryGrid inventory={avatar()?.itemIDList} />
            <AvatarView equipt={avatar() as Ausstattung} level={avatar()?.avatarLevel ?? 1} />
          </>}
          {!avatar() && <>
            <InventoryGrid inventory={undefined} />
            <AvatarView equipt={undefined} level={undefined!} />
          </>}
        </div>
      </div>

      <ItemsView />
    </main>
  );
}

export default App;
