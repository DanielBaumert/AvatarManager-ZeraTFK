import { Component, Show, For, createSignal, ParentComponent } from "solid-js"
import { JSX } from "solid-js/jsx-runtime"
import { Ausstattung } from "../api"
import EquipType from "../api/equipType"
import { Stats, InventoryItem, sumStats, Item, ITEMS } from "../api/items"
import SkillAttribute from "../api/skillAttributes"
import SkillType from "../api/skillType"
import { LeftArrow, RightArrow } from "./Icons"
import { range, toDiconary } from "../utils"

export const Input: Component<JSX.InputHTMLAttributes<HTMLInputElement>> = (props) => {
  return <input {...props} class="bg-[#002a55] p-4 rounded-lg m-2 border-2 text-white"></input>
}

export const Button: ParentComponent<JSX.ButtonHTMLAttributes<HTMLButtonElement>> = (props) => {
  return <button {...props} class="bg-yellow-600 hover:bg-yellow-700 p-4 px-14 rounded shadow text-white">{props.children}</button>
}

export const ViewStats: Component<{ stats: Stats, level: number }> = ({ stats, level }) => {

  return (
    <div class="gap-1">
      <div class="flex flex-row flex-nowrap gap-10">
        <div class="flex flex-col flex-nowrap">
          <div class="size-max">armor: {(stats.armor ?? 0) + level - 1} </div>
          <div class="size-max">health: {(stats.health ?? 0) + (level - 1) * 16} </div>
          <div class="size-max">dmg: {(stats.dmg ?? 0) + (level - 1) * 2} </div>
        </div>
        <div class="flex flex-col flex-nowrap">
          <div class="size-max">spd: {-(stats.spd ?? 0)} </div>
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

export const ItemView: Component<{ item: InventoryItem | undefined }> = ({ item }) => {
  return (<Show when={item !== undefined}
    fallback={<div class="aspect-square size-14 shadow bg-[#023875] border-2 border-[#000000]" />}>
    <div class="flex justify-center">
      <div class="aspect-square size-14 shadow bg-[#023875] border-2 border-[#000000]" />
      <div class="absolute aspect-square size-14 tooltip">
        <div class="tipp">
          <div>{item!.name}({item?.level ?? ''})</div>
          <ViewStats stats={item as Stats} level={item?.level ?? 1} />
        </div>
        <img loading="lazy" src={`/${item!.name}.png`} ></img>
      </div>
    </div>
  </Show>);
}

export const InventoryGrid: Component<{ inventory: InventoryItem[] | undefined }> = (props) => {
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
              <For each={Array.from(range(0, 4))}>
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


export const AvatarView: Component<{ equipt: Ausstattung | undefined, level: number }> = ({ equipt, level }) => {

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

export const ItemCard: Component<{ item: Item }> = ({ item }) => {
  return (
    <div class="text-white bg-[#023875] border-2 border-[#000000] p-2 rounded shadow">
      <div class="flex flex-row justify-between">
        <div>{item.name}</div>
        <img loading="lazy" class="size-14" src={`/${item!.name}.png`} ></img>
      </div>
      <div class="flex flex-row flex-wrap gap-10 w-fit ">
        <div class="flex flex-col flex-nowrap">
          <div class="size-max">armor: {item.armor ?? 0} </div>
          <div class="size-max">health: {item.health ?? 0} </div>
          <div class="size-max">dmg: {item.dmg ?? 0} </div>
        </div>
        <div class="flex flex-col flex-nowrap">
          <div class="size-max">spd: {Math.floor((item.spd ?? 0) * 100) / 100} </div>
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

export const ItemsView: Component = () => {
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
              {(item) => <ItemCard item={item} />}
            </For>
          </div>
        </div>
      }
    </For>
  </div>
}