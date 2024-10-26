import { Component, createResource, createSignal, For, JSX, Show } from "solid-js";
import { Ausstattung, getAvatar } from "./api";
import { InventoryItem, Item, ITEMS, Stats, sumStats } from "./api/items";
import SkillAttribute from "./api/skillAttributes";
import SkillType from "./api/skillType";
import EquipType from "./api/equipType";



function* range(n: number, m: number) {
  for (let i = n; i <= m; i++) {
    yield i;
  }
}

function chunk<T>(src: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < src.length; i += chunkSize) {
    chunks.push(src.slice(i, i + chunkSize));
  }

  return chunks;
}


const toDiconary = <T, E>(src: T[], filter: (arg: T) => E): Map<E, T[]> => {
  const dirc = new Map<E, T[]>();

  for (const element of src) {
    const e : E = filter(element);
    if(dirc.has(e)){ 
      dirc.get(e)!.push(element);
      continue;
    }

    dirc.set(e, [element]);
  }

  return dirc;
}

const LeftArrow: Component = () =>
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
    <path d="M15.293 3.293 6.586 12l8.707 8.707 1.414-1.414L9.414 12l7.293-7.293-1.414-1.414z" />
  </svg>

const RightArrow: Component = () =>
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
    <path d="M7.293 4.707 14.586 12l-7.293 7.293 1.414 1.414L17.414 12 8.707 3.293 7.293 4.707z" />
  </svg>

const Input: Component<JSX.InputHTMLAttributes<HTMLInputElement>> = (props) => {
  return <input {...props} class="bg-[#002a55] p-4 rounded-lg m-2 border-2 text-white"></input>
}

const Button: Component<JSX.ButtonHTMLAttributes<HTMLButtonElement>> = (props) => {
  return <button {...props} class="bg-yellow-600 hover:bg-yellow-700 p-4 px-14 rounded shadow text-white">{props.children}</button>
}

const ViewStats: Component<{ stats: Stats, level: number }> = ({ stats, level }) => {

  return (
    <div class="gap-1">
      <div class="flex flex-row flex-nowrap gap-10">
        <div class="flex flex-col flex-nowrap">
          <div class="size-max">armor: {(stats.armor ?? 0) + level - 1} </div>
          <div class="size-max">health: {(stats.health ?? 0) + (level - 1) * 16} </div>
          <div class="size-max">dmg: {(stats.dmg ?? 0) + (level - 1) * 2} </div>
        </div>
        <div class="flex flex-col flex-nowrap">
          <div class="size-max">spd: {-(stats.spd ?? 0) * 10 } </div>
          <div class="size-max">magicArmor: {(stats.mArmor ?? 0) + level - 1} </div>
          <div class="size-max">magicDmg: {(stats.mDmg ?? 0) + (level - 1) * 2} </div>
        </div>
      </div>
      <Show when={stats.skill}>
        <For each={stats.skill}>
          {skill =>
            <div>
              <hr />
              <div>{SkillAttribute[skill.attribute]}</div>
              <div class="pl-1">
                <div class="size-max">Type:  {SkillType[skill.type]}</div>
                <div class="size-max">Value: {skill.Value}</div>
                <div class="size-max">Delay: {skill.Delay}</div>
              </div>
            </div>}
        </For>
      </Show>
    </div>
  )
}

const ItemView: Component<{ item: InventoryItem | undefined }> = ({ item }) => {
  return (<Show when={item !== undefined}
    fallback={<div class="aspect-square size-14 shadow bg-[#023875] border-2 border-[#000000]" />}>
    <div class="flex justify-center">
      <div class="aspect-square size-14 shadow bg-[#023875] border-2 border-[#000000]" />
      <div class="absolute aspect-square size-14 tooltip">
        <div class="tipp">
          <div>{item!.name}({item?.level ?? ''})</div>
          <ViewStats stats={item as Stats} level={item?.level ?? 1} />
        </div>
        <img src={`/${item!.name}.png`} ></img>
      </div>
    </div>
  </Show>);
}

const InventoryGrid: Component<{ inventory: InventoryItem[] | undefined }> = (props) => {
  const [page, setPage] = createSignal(0);

  const previewPage = () => {
    if (page() === 0) {
      return;
    }

    setPage(page() - 1);
  }
  const nextPage = () => {
    if (page() === 7) {
      return;
    }

    setPage(page() + 1);
  }

  return (
    <div>
      <div class="flex flex-row gap-1">
        <div class="flex items-center" >
          <div
            onClick={previewPage}
            class="bg-yellow-600 hover:bg-yellow-700 py-8 px-2 rounded shadow fill-white">
            <LeftArrow />
          </div>
        </div>
        <For each={Array.from(range(0, 7))}>
          {iP => <Show when={iP == page()}>
            <div class="flex flex-col gap-1">
              <For each={Array.from(range(0, 5))}>
                {x =>
                  <div class="flex flex-row gap-1">
                    <For each={Array.from(range(1, 5))}>
                      {y => {
                        const index = (page() * 5 * 5) + ((x * 5 + y) - 1);
                        const item = props.inventory?.[index];
                        return <ItemView item={item} />
                      }}
                    </For>
                  </div>}
              </For>
            </div>
          </Show>}
        </For>
        <div class="flex items-center">
          <div
            onClick={nextPage}
            class="bg-yellow-600 hover:bg-yellow-700 py-8 px-2 rounded shadow fill-white">
            <RightArrow />
          </div>
        </div>
      </div>
      <div class="flex flex-col items-center select-none">
        {`${page() + 1} / 8`}
      </div>
    </div>)
}


const AvatarView: Component<{ equipt: Ausstattung | undefined, level: number }> = ({equipt, level }) => {

  const ItemPlace: Component<{ title: string, item: number | undefined }> = ({ title, item }) => {

    const inventoryItem = item === undefined
      ? undefined
      : equipt?.itemIDList?.find(x => x.id === item);


    return <div class={`flex flex-col justify-center items-center select-none relative`}
      data-info={inventoryItem?.name}>
      <p>{title}</p>
      <ItemView item={inventoryItem} />
    </div>
  }

  return (
    <div>
      <div class="flex flex-row">
        <div class="flex flex-col gap-1 justify-center">
          <ItemPlace title="Rechte Hand" item={equipt?.rWeapon} />
          <ItemPlace title="Linke Hand" item={equipt?.lWeapon} />
        </div>
        <div class="flex flex-col">
          <div class="flex flex-row gap-1 items-center">
            <ItemPlace title="Kopf oben" item={equipt?.headTop} />
            <ItemPlace title="Kopf vorne" item={equipt?.headFront} />
            <ItemPlace title="Kopf haare" item={equipt?.headHair} />
          </div>
          <div class="flex flex-row gap-1 justify-center">
            <ItemPlace title="Rüstung" item={equipt?.armor} />
            <ItemPlace title="Rücken" item={equipt?.back} />
          </div>
          <div class="flex flex-row justify-center">
            <ItemPlace title="Schuhe" item={equipt?.shoes} />
          </div>
        </div>
      </div>
      <div>
        <ViewStats stats={sumStats(equipt) as Stats} level={level} />
      </div>
    </div>
  );
}

const ItemCard: Component<{ item: Item }> = ({ item }) => {
  return (
    <div class="text-white bg-[#023875] border-2 border-[#000000] p-2 rounded shadow">
      <div class="flex flex-row justify-between">
        <div>{item.name}</div>
        <img class="size-14" src={`/${item!.name}.png`} ></img>
      </div>
      <div class="flex flex-row flex-wrap gap-10 w-fit ">
        <div class="flex flex-col flex-nowrap">
          <div class="size-max">armor: {item.armor ?? 0} </div>
          <div class="size-max">health: {item.health ?? 0} </div>
          <div class="size-max">dmg: {item.dmg ?? 0} </div>
        </div>
        <div class="flex flex-col flex-nowrap">
          <div class="size-max">spd: {Math.floor((item.spd ?? 0) * 100) / 10} </div>
          <div class="size-max">magicArmor: {item.mArmor ?? 0} </div>
          <div class="size-max">magicDmg: {item.mDmg ?? 0} </div>
        </div>
      </div>
      <Show when={item.skill}>
        <For each={item.skill}>
          {skill =>
            <div>
              <hr />
              <div>{SkillAttribute[skill.attribute]}</div>
              <div class="pl-1">
                <div class="size-max">Type:  {SkillType[skill.type]}</div>
                <div class="size-max">Value: {skill.Value}</div>
                <div class="size-max">Delay: {skill.Delay}</div>
              </div>
            </div>}
        </For>
      </Show>
    </div>);
}

const ItemsView : Component = () => { 
  const dir = toDiconary(ITEMS, e => EquipType[e.equipType]
    .replace("HeadFont", " Head Font")
    .replace("HeadTop", "Head Top")
    .replace("_L", " Left")
    .replace("_R", " Right"));

  return <div class="bg-[#025E9C] gap-2 p-8 min-w-[50%]">
    <For each={Array.from(dir.keys())}>
      {(key) =>
        <div>
          <div class="w-100 text-white border-b-2 border-b-yellow-600 p-2 my-2">{key}</div>
          <div class="flex flex-wrap gap-2">
            <For each={dir.get(key)}>
              {(item) => <ItemCard item={item}/> }
            </For>
          </div>
        </div> 
        }
    </For>
  </div>
}


const App: Component = () => {

  const [id, setId] = createSignal<string | undefined>(undefined);
  const [avatar, { refetch, mutate }] = createResource(id, async id => await getAvatar(id));

  let tempId: string | undefined;

  const onIdChanged = (e: Event) => {
    tempId = (e.target as HTMLInputElement).value;
  }

  return (<div class="absolute flex flex-col justify-center items-center w-screen p-8 gap-8 bg-[#112a36]">
    <div class="bg-[#025E9C] p-8 min-w-[50%]">
      <div class="flex flex-row items-center justify-center mb-4">
        <Input type="text" onchange={onIdChanged} />
        <Button onclick={() => { mutate(undefined); setId(tempId); }}>Suchen</Button>
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
    
  </div>);
}

export default App;
